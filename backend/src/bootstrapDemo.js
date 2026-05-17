import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Doctor } from './models/Doctor.js';
import { Appointment } from './models/Appointment.js';
import {
  DEMO_DOCTORS,
  DEMO_DOCTOR_EMAILS,
  DEMO_DOCTOR_PASSWORD,
  weekSlots,
} from './demoAccounts.js';

const DEMO_ADMIN_EMAIL = 'admin@clinicsync.com';
const DEMO_ADMIN_PASSWORD = 'Admin123!';

function allowDemoBootstrap() {
  const allowInProd =
    process.env.BOOTSTRAP_DEMO_ADMIN === 'true' || process.env.BOOTSTRAP_DEMO_DOCTORS === 'true';
  return process.env.NODE_ENV !== 'production' || allowInProd;
}

/**
 * Ensures the login shown on the marketing/login page works in local dev when
 * the database has never been seeded (no admin user yet).
 */
export async function ensureDemoAdmin() {
  if (!allowDemoBootstrap()) return;
  const existing = await User.findOne({ email: DEMO_ADMIN_EMAIL });
  if (existing) return;

  const hashed = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 12);
  await User.create({
    name: 'Clinic Admin',
    email: DEMO_ADMIN_EMAIL,
    password: hashed,
    role: 'admin',
  });
  console.log(
    `[bootstrap] Created demo admin ${DEMO_ADMIN_EMAIL} (password: ${DEMO_ADMIN_PASSWORD}).`
  );
}

/**
 * Keeps exactly five doctor profiles with login accounts. Removes any other doctors
 * left over from older seeds or manual creation.
 */
export async function ensureDemoDoctors() {
  if (!allowDemoBootstrap()) return;

  const allDoctors = await Doctor.find().select('_id user email');
  const toRemove = allDoctors.filter((d) => !DEMO_DOCTOR_EMAILS.includes(d.email.toLowerCase()));

  if (toRemove.length) {
    const doctorIds = toRemove.map((d) => d._id);
    const userIds = toRemove.map((d) => d.user).filter(Boolean);
    await Appointment.updateMany({ doctor: { $in: doctorIds } }, { status: 'cancelled' });
    await Doctor.deleteMany({ _id: { $in: doctorIds } });
    if (userIds.length) {
      await User.deleteMany({ _id: { $in: userIds }, role: 'doctor' });
    }
    console.log(`[bootstrap] Removed ${toRemove.length} doctor(s) outside the fixed roster of 5.`);
  }

  const hashed = await bcrypt.hash(DEMO_DOCTOR_PASSWORD, 12);

  for (const row of DEMO_DOCTORS) {
    const email = row.email.toLowerCase().trim();
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: row.fullName,
        email,
        password: hashed,
        role: 'doctor',
      });
    } else if (user.role === 'doctor') {
      user.name = row.fullName;
      await user.save();
    }

    const availability = weekSlots(
      row.availabilityDays,
      row.availabilityHours.startTime,
      row.availabilityHours.endTime
    );

    let doctor = await Doctor.findOne({ email });
    if (!doctor) {
      await Doctor.create({
        user: user._id,
        fullName: row.fullName,
        email,
        phoneNumber: row.phoneNumber,
        specialization: row.specialization,
        yearsOfExperience: row.yearsOfExperience,
        gender: row.gender,
        bio: row.bio,
        availability,
      });
    } else {
      doctor.user = user._id;
      doctor.fullName = row.fullName;
      doctor.phoneNumber = row.phoneNumber;
      doctor.specialization = row.specialization;
      doctor.yearsOfExperience = row.yearsOfExperience;
      doctor.gender = row.gender;
      doctor.bio = row.bio;
      doctor.availability = availability;
      await doctor.save();
    }
  }

  const count = await Doctor.countDocuments({ email: { $in: DEMO_DOCTOR_EMAILS } });
  if (count !== DEMO_DOCTORS.length) {
    console.warn(`[bootstrap] Expected ${DEMO_DOCTORS.length} doctors, found ${count}.`);
  }
}
