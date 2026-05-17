import { Patient } from '../models/Patient.js';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';

export async function getMyProfile(req, res, next) {
  try {
    const patient = await Patient.findOne({ user: req.user.id }).populate('user', 'email name');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ patient });
  } catch (e) {
    next(e);
  }
}

export async function listPatients(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = req.query.search || '';
    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { medicalHistory: new RegExp(search, 'i') },
      ];
    }
    const [items, total] = await Promise.all([
      Patient.find(filter)
        .populate('user', 'email name')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Patient.countDocuments(filter),
    ]);
    res.json({ patients: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (e) {
    next(e);
  }
}

export async function getPatient(req, res, next) {
  try {
    const patient = await Patient.findById(req.params.id).populate('user', 'email name');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    if (req.user.role === 'patient' && patient.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json({ patient });
  } catch (e) {
    next(e);
  }
}

export async function updatePatientProfile(req, res, next) {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
    const { name, age, gender, medicalHistory } = req.body;
    if (name) {
      patient.name = name;
      await User.findByIdAndUpdate(req.user.id, { name });
    }
    if (age !== undefined) patient.age = age;
    if (gender) patient.gender = gender;
    if (medicalHistory !== undefined) patient.medicalHistory = medicalHistory;
    await patient.save();
    res.json({ patient });
  } catch (e) {
    next(e);
  }
}

export async function addMedicalNote(req, res, next) {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Note content required' });
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (req.user.role === 'doctor' && !doctor) {
      return res.status(400).json({ message: 'Doctor profile missing' });
    }
    const doctorId = req.user.role === 'doctor' ? doctor._id : req.body.doctorId;
    if (!doctorId) return res.status(400).json({ message: 'doctorId required for admin notes' });
    patient.medicalNotes.push({
      doctor: doctorId,
      content: content.trim(),
    });
    await patient.save();
    const populated = await Patient.findById(patient._id).populate(
      'medicalNotes.doctor',
      'fullName specialization'
    );
    res.json({ patient: populated });
  } catch (e) {
    next(e);
  }
}
