import { Appointment } from '../models/Appointment.js';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { isDayAvailable } from '../utils/slots.js';

function startEndOfDay(dateStr) {
  const start = new Date(dateStr + 'T00:00:00.000Z');
  const end = new Date(dateStr + 'T23:59:59.999Z');
  return { start, end };
}

export async function listAppointments(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient) return res.json({ appointments: [], pagination: { page, limit, total: 0, pages: 0 } });
      filter.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) return res.json({ appointments: [], pagination: { page, limit, total: 0, pages: 0 } });
      filter.doctor = doctor._id;
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('patient', 'name age gender')
        .populate('doctor', 'fullName specialization')
        .sort({ date: -1, time: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Appointment.countDocuments(filter),
    ]);
    res.json({
      appointments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 0 },
    });
  } catch (e) {
    next(e);
  }
}

export async function createAppointment(req, res, next) {
  try {
    const { doctorId, date, time, notes } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: 'doctorId, date, and time are required' });
    }
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return res.status(400).json({ message: 'Patient profile not found' });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const dayDate = new Date(date + 'T12:00:00.000Z');
    if (!isDayAvailable(dayDate, doctor.availability)) {
      return res.status(400).json({ message: 'Doctor is not available on this day' });
    }

    const { start, end } = startEndOfDay(date);
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: start, $lte: end },
      time,
      status: { $nin: ['cancelled'] },
    });
    if (conflict) {
      return res.status(409).json({ message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      date: new Date(date + 'T12:00:00.000Z'),
      time,
      notes: notes || '',
      status: 'pending',
    });
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name')
      .populate('doctor', 'fullName specialization');
    res.status(201).json({ appointment: populated });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: 'This time slot is already booked' });
    }
    next(e);
  }
}

export async function updateAppointmentStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'approved', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      if (!['pending', 'approved', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid transition' });
      }
    } else if (req.user.role === 'admin') {
      // admin can set any
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    appointment.status = status;
    if (req.body.notes !== undefined) appointment.notes = req.body.notes;
    await appointment.save();
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name')
      .populate('doctor', 'fullName specialization');
    res.json({ appointment: populated });
  } catch (e) {
    next(e);
  }
}

export async function cancelAppointment(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patient');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient || appointment.patient._id.toString() !== patient._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else if (req.user.role === 'admin') {
      // ok
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ appointment });
  } catch (e) {
    next(e);
  }
}
