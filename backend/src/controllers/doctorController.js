import mongoose from 'mongoose';
import { Doctor } from '../models/Doctor.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { Appointment } from '../models/Appointment.js';
import { DEMO_DOCTOR_EMAILS, isDemoDoctorEmail, MAX_DOCTORS } from '../demoAccounts.js';
import {
  generateSlotsForDayDate,
  hasBookableWeeklySchedule,
  isDayAvailable,
} from '../utils/slots.js';

function startEndOfDay(dateStr) {
  const start = new Date(dateStr + 'T00:00:00.000Z');
  const end = new Date(dateStr + 'T23:59:59.999Z');
  return { start, end };
}

async function countOpenSlotsOnDate(doctor, dateStr) {
  const dayDate = new Date(dateStr + 'T12:00:00.000Z');
  if (!isDayAvailable(dayDate, doctor.availability)) return 0;
  const slots = generateSlotsForDayDate(dayDate, doctor.availability);
  if (!slots.length) return 0;
  const { start, end } = startEndOfDay(dateStr);
  const booked = await Appointment.find({
    doctor: doctor._id,
    date: { $gte: start, $lte: end },
    status: { $nin: ['cancelled'] },
  }).select('time');
  const taken = new Set(booked.map((a) => a.time));
  return slots.filter((s) => !taken.has(s)).length;
}

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function defaultWeeklyAvailability() {
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => ({
    day,
    startTime: '09:00',
    endTime: '17:00',
    slotMinutes: 30,
  }));
}

function normalizeAvailability(input) {
  if (!input) return defaultWeeklyAvailability();
  if (!Array.isArray(input)) {
    throw Object.assign(new Error('availability must be an array of { day, startTime, endTime }'), {
      status: 400,
    });
  }
  if (input.length === 0) return defaultWeeklyAvailability();
  const out = [];
  for (const row of input) {
    if (!row || typeof row !== 'object') continue;
    const day = String(row.day || '').toLowerCase().trim();
    if (!WEEKDAYS.includes(day)) {
      throw Object.assign(new Error(`Invalid availability day: ${row.day}`), { status: 400 });
    }
    const startTime = String(row.startTime || '09:00').trim();
    const endTime = String(row.endTime || '17:00').trim();
    const slotMinutes = Math.min(120, Math.max(15, Number(row.slotMinutes) || 30));
    out.push({ day, startTime, endTime, slotMinutes });
  }
  if (!out.length) return defaultWeeklyAvailability();
  return out;
}

export async function listDoctors(req, res, next) {
  try {
    const { specialization, search, date, availableOnly } = req.query;
    const filter = {};
    const clauses = [];
    if (specialization) {
      clauses.push({ specialization: new RegExp(String(specialization).trim(), 'i') });
    }
    if (search) {
      clauses.push({
        $or: [
          { fullName: new RegExp(String(search).trim(), 'i') },
          { specialization: new RegExp(String(search).trim(), 'i') },
        ],
      });
    }
    if (clauses.length) filter.$and = clauses;
    filter.email = { $in: DEMO_DOCTOR_EMAILS };
    filter.user = { $exists: true, $ne: null };
    let doctors = await Doctor.find(filter)
      .populate('user', 'email name')
      .sort({ fullName: 1 })
      .lean();

    const restrictToAvailable = availableOnly !== 'false';
    if (restrictToAvailable) {
      doctors = doctors.filter((d) => hasBookableWeeklySchedule(d.availability));
    }

    if (date && /^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
      const dateStr = String(date);
      const withOpenSlots = [];
      for (const d of doctors) {
        const open = await countOpenSlotsOnDate(d, dateStr);
        if (open > 0) withOpenSlots.push(d);
      }
      doctors = withOpenSlots;
    }

    res.json({ doctors });
  } catch (e) {
    next(e);
  }
}

export async function getDoctor(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid doctor id' });
    }
    const doctor = await Doctor.findById(id).populate('user', 'email name');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (!isDemoDoctorEmail(doctor.email) || !doctor.user) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ doctor });
  } catch (e) {
    next(e);
  }
}

export async function getAvailableSlots(req, res, next) {
  try {
    const { id } = req.params;
    const { date } = req.query;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid doctor id' });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
      return res.status(400).json({ message: 'date query required (YYYY-MM-DD)' });
    }
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (!isDemoDoctorEmail(doctor.email)) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    const dayDate = new Date(date + 'T12:00:00.000Z');
    if (!isDayAvailable(dayDate, doctor.availability)) {
      return res.json({ slots: [], message: 'Doctor not available on this day' });
    }
    const slots = generateSlotsForDayDate(dayDate, doctor.availability);
    const start = new Date(date + 'T00:00:00.000Z');
    const end = new Date(date + 'T23:59:59.999Z');
    const booked = await Appointment.find({
      doctor: doctor._id,
      date: { $gte: start, $lte: end },
      status: { $nin: ['cancelled'] },
    }).select('time');
    const taken = new Set(booked.map((a) => a.time));
    const available = slots.filter((s) => !taken.has(s));
    res.json({ slots: available });
  } catch (e) {
    next(e);
  }
}

export async function createDoctor(req, res, next) {
  try {
    res.status(403).json({
      message: `This clinic uses a fixed roster of ${MAX_DOCTORS} doctors with login accounts. Edit an existing profile instead.`,
    });
  } catch (e) {
    next(e);
  }
}

export async function updateDoctor(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid doctor id' });
    }
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const {
      fullName,
      email,
      phoneNumber,
      specialization,
      yearsOfExperience,
      gender,
      availability: availabilityRaw,
      profileImage,
      bio,
      password,
    } = req.body;

    if (fullName !== undefined) doctor.fullName = String(fullName).trim();
    if (specialization !== undefined) doctor.specialization = String(specialization).trim();
    if (phoneNumber !== undefined) doctor.phoneNumber = String(phoneNumber).trim();
    if (yearsOfExperience !== undefined) doctor.yearsOfExperience = Number(yearsOfExperience);
    if (gender !== undefined) doctor.gender = gender;
    if (profileImage !== undefined) doctor.profileImage = String(profileImage).trim();
    if (bio !== undefined) doctor.bio = String(bio).trim();

    if (email !== undefined) {
      const nextEmail = String(email).toLowerCase().trim();
      if (isDemoDoctorEmail(doctor.email) && nextEmail !== doctor.email.toLowerCase()) {
        return res.status(400).json({ message: 'Login email cannot be changed for roster doctors.' });
      }
      const clashUser = await User.findOne({
        email: nextEmail,
        _id: { $ne: doctor.user },
      });
      if (clashUser) return res.status(409).json({ message: 'Email already in use' });
      const clashDoc = await Doctor.findOne({
        email: nextEmail,
        _id: { $ne: doctor._id },
      });
      if (clashDoc) return res.status(409).json({ message: 'Email already in use' });
      doctor.email = nextEmail;
      if (doctor.user) {
        await User.findByIdAndUpdate(doctor.user, { email: nextEmail });
      }
    }

    if (availabilityRaw !== undefined) {
      try {
        doctor.availability = normalizeAvailability(availabilityRaw);
      } catch (err) {
        return res.status(err.status || 400).json({ message: err.message });
      }
    }

    if (password !== undefined && String(password).length > 0) {
      if (String(password).length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      const hashed = await bcrypt.hash(String(password), 12);
      if (doctor.user) await User.findByIdAndUpdate(doctor.user, { password: hashed });
    }

    if (doctor.user && fullName !== undefined) {
      await User.findByIdAndUpdate(doctor.user, { name: doctor.fullName });
    }

    await doctor.save();
    const populated = await Doctor.findById(doctor._id).populate('user', 'email name');
    res.json({ doctor: populated });
  } catch (e) {
    next(e);
  }
}

export async function deleteDoctor(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid doctor id' });
    }
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (isDemoDoctorEmail(doctor.email)) {
      return res.status(403).json({
        message: 'Core clinic doctors cannot be removed. Update their profile or availability instead.',
      });
    }
    await Appointment.updateMany({ doctor: doctor._id }, { status: 'cancelled' });
    await Doctor.findByIdAndDelete(doctor._id);
    if (doctor.user) await User.findByIdAndDelete(doctor.user);
    res.json({ message: 'Doctor removed' });
  } catch (e) {
    next(e);
  }
}
