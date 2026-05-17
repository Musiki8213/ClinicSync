import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './src/config/db.js';
import { User } from './src/models/User.js';
import { Doctor } from './src/models/Doctor.js';
import { Appointment } from './src/models/Appointment.js';
import { DEMO_DOCTORS, DEMO_DOCTOR_PASSWORD, weekSlots } from './src/demoAccounts.js';

dotenv.config();

/**
 * Replaces all doctor profiles with the 5 demo doctors (each with a login).
 * Does not remove admin/patient users. Prefer `npm run seed` for a full reset.
 */
async function seedDoctors() {
  await connectDB();

  const existing = await Doctor.find().select('_id user');
  if (existing.length) {
    const doctorIds = existing.map((d) => d._id);
    const userIds = existing.map((d) => d.user).filter(Boolean);
    await Appointment.updateMany({ doctor: { $in: doctorIds } }, { status: 'cancelled' });
    await Doctor.deleteMany({ _id: { $in: doctorIds } });
    if (userIds.length) {
      await User.deleteMany({ _id: { $in: userIds }, role: 'doctor' });
    }
    console.log(`Removed ${existing.length} existing doctor profile(s).`);
  }

  const hashed = await bcrypt.hash(DEMO_DOCTOR_PASSWORD, 12);
  let inserted = 0;
  for (const row of DEMO_DOCTORS) {
    const email = row.email.toLowerCase().trim();
    const user = await User.create({
      name: row.fullName,
      email,
      password: hashed,
      role: 'doctor',
    });
    await Doctor.create({
      user: user._id,
      fullName: row.fullName,
      email,
      phoneNumber: row.phoneNumber,
      specialization: row.specialization,
      yearsOfExperience: row.yearsOfExperience,
      gender: row.gender,
      availability: weekSlots(row.availabilityDays, row.availabilityHours.startTime, row.availabilityHours.endTime),
      bio: row.bio,
    });
    inserted += 1;
  }

  console.log(`Inserted ${inserted} demo doctors. Password for all: ${DEMO_DOCTOR_PASSWORD}`);
  for (const d of DEMO_DOCTORS) {
    console.log(`  ${d.email}`);
  }
  await mongoose.disconnect();
}

seedDoctors().catch((err) => {
  console.error(err);
  process.exit(1);
});
