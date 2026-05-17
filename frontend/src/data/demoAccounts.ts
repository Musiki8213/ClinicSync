/** Demo logins shown on the login page (must match backend seed). */
export const DEMO_ADMIN = { email: 'admin@clinicsync.com', password: 'Admin123!' }

export const DEMO_PATIENT_PASSWORD = 'Patient123!'

export const DEMO_PATIENTS = [
  { name: 'Alex Morgan', email: 'alex@clinicsync.com' },
  { name: 'Jordan Lee', email: 'jordan@clinicsync.com' },
] as const

export const DEMO_DOCTOR_PASSWORD = 'Doctor123!'

export type LoginPortalRole = 'patient' | 'doctor' | 'admin'

export const MAX_DOCTORS = 5

export const DEMO_DOCTORS = [
  { name: 'Dr. Sarah Chen', email: 'sarah.chen@clinicsync.com', specialty: 'Cardiology' },
  { name: 'Dr. James Okonkwo', email: 'james.okonkwo@clinicsync.com', specialty: 'Pediatrics' },
  { name: 'Dr. Emily Rivera', email: 'emily.rivera@clinicsync.com', specialty: 'Dermatology' },
  { name: 'Dr. Michael Chen', email: 'michael.chen@clinicsync.com', specialty: 'Neurology' },
  { name: 'Dr. Priya Sharma', email: 'priya.sharma@clinicsync.com', specialty: 'General Practice' },
] as const

const DEMO_DOCTOR_EMAIL_SET = new Set(DEMO_DOCTORS.map((d) => d.email.toLowerCase()))

export function isDemoDoctorEmail(email: string) {
  return DEMO_DOCTOR_EMAIL_SET.has(email.toLowerCase().trim())
}
