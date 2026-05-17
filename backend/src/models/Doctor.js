import mongoose from 'mongoose';

const ALLOWED_DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const availabilityEntrySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ALLOWED_DAYS,
    },
    startTime: { type: String, required: true, default: '09:00', trim: true },
    endTime: { type: String, required: true, default: '17:00', trim: true },
    slotMinutes: { type: Number, default: 30, min: 15, max: 120 },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email'],
    },
    phoneNumber: { type: String, trim: true, default: '' },
    specialization: { type: String, required: true, trim: true },
    yearsOfExperience: { type: Number, default: 0, min: 0, max: 70 },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say',
    },
    availability: { type: [availabilityEntrySchema], default: [] },
    profileImage: { type: String, trim: true, default: '' },
    bio: { type: String, default: '', maxlength: 2000 },
  },
  { timestamps: true }
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ fullName: 'text', specialization: 'text' });
doctorSchema.index({ email: 1 }, { unique: true });

export const Doctor = mongoose.model('Doctor', doctorSchema);
