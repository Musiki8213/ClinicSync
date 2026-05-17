import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Doctor } from './models/Doctor.js';
import { Patient } from './models/Patient.js';
import { Appointment } from './models/Appointment.js';
import { connectDB } from './config/db.js';
import { DEMO_DOCTORS, DEMO_DOCTOR_PASSWORD, weekSlots } from './demoAccounts.js';

dotenv.config();

async function seed() {
  await connectDB();
  await Promise.all([
    Appointment.deleteMany({}),
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
    User.deleteMany({}),
  ]);

  const adminPass = await bcrypt.hash('Admin123!', 12);
  const docPass = await bcrypt.hash(DEMO_DOCTOR_PASSWORD, 12);
  const patPass = await bcrypt.hash('Patient123!', 12);

  await User.create({
    name: 'Clinic Admin',
    email: 'admin@clinicsync.com',
    password: adminPass,
    role: 'admin',
  });

  const docUsers = await User.insertMany(
    DEMO_DOCTORS.map((d) => ({
      name: d.fullName,
      email: d.email,
      password: docPass,
      role: 'doctor',
    }))
  );

  const doctors = await Doctor.insertMany(
    DEMO_DOCTORS.map((d, i) => ({
      user: docUsers[i]._id,
      fullName: d.fullName,
      email: d.email,
      phoneNumber: d.phoneNumber,
      specialization: d.specialization,
      yearsOfExperience: d.yearsOfExperience,
      gender: d.gender,
      bio: d.bio,
      availability: weekSlots(d.availabilityDays, d.availabilityHours.startTime, d.availabilityHours.endTime),
    }))
  );

  const patUsers = await User.insertMany([
    { name: 'Alex Morgan', email: 'alex@clinicsync.com', password: patPass, role: 'patient' },
    { name: 'Jordan Lee', email: 'jordan@clinicsync.com', password: patPass, role: 'patient' },
  ]);

  const patients = await Patient.insertMany([
    { user: patUsers[0]._id, name: 'Alex Morgan', age: 34, gender: 'male', medicalHistory: 'Seasonal allergies' },
    { user: patUsers[1]._id, name: 'Jordan Lee', age: 28, gender: 'female', medicalHistory: 'None reported' },
  ]);

  const today = new Date();
  const iso = today.toISOString().slice(0, 10);

  await Appointment.create([
    {
      patient: patients[0]._id,
      doctor: doctors[0]._id,
      date: new Date(iso + 'T12:00:00.000Z'),
      time: '10:00',
      status: 'approved',
      notes: 'Follow-up ECG',
    },
    {
      patient: patients[1]._id,
      doctor: doctors[1]._id,
      date: new Date(iso + 'T12:00:00.000Z'),
      time: '11:00',
      status: 'pending',
      notes: 'Well-child visit',
    },
    {
      patient: patients[0]._id,
      doctor: doctors[3]._id,
      date: new Date(iso + 'T12:00:00.000Z'),
      time: '09:00',
      status: 'pending',
      notes: 'Headache consultation',
    },
  ]);

  console.log('Seed complete.');
  console.log('Admin: admin@clinicsync.com / Admin123!');
  console.log(`Doctors (${DEMO_DOCTORS.length}) — each has their own email, shared demo password ${DEMO_DOCTOR_PASSWORD}:`);
  for (const d of DEMO_DOCTORS) {
    console.log(`  ${d.email}`);
  }
  console.log('Patients: alex@clinicsync.com, jordan@clinicsync.com / Patient123!');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
