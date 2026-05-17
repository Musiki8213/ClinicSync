import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function dashboardStats(req, res, next) {
  try {
    const role = req.user.role;
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    if (role === 'admin') {
      const [totalDoctors, totalPatients, totalAppointments, upcoming] = await Promise.all([
        Doctor.countDocuments(),
        Patient.countDocuments(),
        Appointment.countDocuments(),
        Appointment.countDocuments({
          date: { $gte: todayStart },
          status: { $in: ['pending', 'approved'] },
        }),
      ]);
      const pendingApprovals = await Appointment.countDocuments({ status: 'pending' });
      const todayAppointments = await Appointment.countDocuments({
        date: { $gte: todayStart, $lte: todayEnd },
        status: { $nin: ['cancelled'] },
      });
      return res.json({
        totalDoctors,
        totalPatients,
        totalAppointments,
        upcomingAppointments: upcoming,
        pendingApprovals,
        todayAppointments,
      });
    }

    if (role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) {
        return res.json({
          todayAppointments: 0,
          pendingAppointments: 0,
          completedConsultations: 0,
        });
      }
      const filterBase = { doctor: doctor._id };
      const [todayAppointments, pendingAppointments, completedConsultations] = await Promise.all([
        Appointment.countDocuments({
          ...filterBase,
          date: { $gte: todayStart, $lte: todayEnd },
          status: { $nin: ['cancelled'] },
        }),
        Appointment.countDocuments({ ...filterBase, status: 'pending' }),
        Appointment.countDocuments({ ...filterBase, status: 'completed' }),
      ]);
      return res.json({ todayAppointments, pendingAppointments, completedConsultations });
    }

    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.json({ upcomingAppointments: 0, pastAppointments: 0 });
    }
    const [upcoming, past] = await Promise.all([
      Appointment.countDocuments({
        patient: patient._id,
        status: { $in: ['pending', 'approved'] },
        date: { $gte: todayStart },
      }),
      Appointment.countDocuments({
        patient: patient._id,
        $or: [{ status: { $in: ['completed', 'cancelled'] } }, { date: { $lt: todayStart } }],
      }),
    ]);
    return res.json({ upcomingAppointments: upcoming, pastAppointments: past });
  } catch (e) {
    next(e);
  }
}
