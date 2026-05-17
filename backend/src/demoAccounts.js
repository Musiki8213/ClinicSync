/** Shared demo credentials printed by seed scripts and shown on the login page. */
export const DEMO_DOCTOR_PASSWORD = 'Doctor123!';

export const MAX_DOCTORS = 5;

export const DEMO_DOCTORS = [
  {
    fullName: 'Dr. Sarah Chen',
    email: 'sarah.chen@clinicsync.com',
    phoneNumber: '+1-555-0101',
    specialization: 'Cardiology',
    yearsOfExperience: 14,
    gender: 'female',
    bio: 'Board-certified cardiologist focused on preventive care and heart failure management.',
    availabilityDays: ['monday', 'tuesday', 'wednesday', 'thursday'],
    availabilityHours: { startTime: '09:00', endTime: '16:00' },
  },
  {
    fullName: 'Dr. James Okonkwo',
    email: 'james.okonkwo@clinicsync.com',
    phoneNumber: '+1-555-0102',
    specialization: 'Pediatrics',
    yearsOfExperience: 9,
    gender: 'male',
    bio: 'Pediatrician with a calm bedside manner and emphasis on developmental milestones.',
    availabilityDays: ['tuesday', 'wednesday', 'friday'],
    availabilityHours: { startTime: '10:00', endTime: '17:00' },
  },
  {
    fullName: 'Dr. Emily Rivera',
    email: 'emily.rivera@clinicsync.com',
    phoneNumber: '+1-555-0103',
    specialization: 'Dermatology',
    yearsOfExperience: 11,
    gender: 'female',
    bio: 'Dermatology specialist treating acne, eczema, and skin cancer screening.',
    availabilityDays: ['monday', 'wednesday', 'friday'],
    availabilityHours: { startTime: '09:00', endTime: '15:00' },
  },
  {
    fullName: 'Dr. Michael Chen',
    email: 'michael.chen@clinicsync.com',
    phoneNumber: '+1-555-0104',
    specialization: 'Neurology',
    yearsOfExperience: 16,
    gender: 'male',
    bio: 'Neurologist with focus on migraine disorders, epilepsy, and cognitive health.',
    availabilityDays: ['monday', 'tuesday', 'thursday'],
    availabilityHours: { startTime: '08:00', endTime: '14:00' },
  },
  {
    fullName: 'Dr. Priya Sharma',
    email: 'priya.sharma@clinicsync.com',
    phoneNumber: '+1-555-0105',
    specialization: 'General Practice',
    yearsOfExperience: 12,
    gender: 'female',
    bio: 'General practitioner for check-ups, chronic care, and referrals to specialists.',
    availabilityDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    availabilityHours: { startTime: '08:30', endTime: '16:30' },
  },
];

/** Lowercase emails for the fixed doctor roster (each has a User login). */
export const DEMO_DOCTOR_EMAILS = DEMO_DOCTORS.map((d) => d.email.toLowerCase());

export function isDemoDoctorEmail(email) {
  return DEMO_DOCTOR_EMAILS.includes(String(email || '').toLowerCase().trim());
}

export function weekSlots(days, startTime, endTime) {
  return days.map((day) => ({ day, startTime, endTime, slotMinutes: 30 }));
}
