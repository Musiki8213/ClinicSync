import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const patientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 0, max: 150 },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_say'], default: 'prefer_not_say' },
    medicalHistory: { type: String, default: '' },
    medicalNotes: [noteSchema],
  },
  { timestamps: true }
);

patientSchema.index({ name: 'text' });

export const Patient = mongoose.model('Patient', patientSchema);
