import { DEMO_DOCTORS } from '@/data/demoAccounts'
import {
  Building2,
  CalendarCheck,
  ClipboardList,
  Lock,
  Stethoscope,
  UserPlus,
  Users,
} from 'lucide-react'

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Patients', href: '#how-it-works' },
  { label: 'Doctors', href: '#doctors' },
  { label: 'Contact', href: '#contact' },
] as const

export const STATS = [
  { label: 'Clinics', value: '500+', icon: Building2 },
  { label: 'Patients', value: '10,000+', icon: Users },
  { label: 'Doctors', value: '800+', icon: Stethoscope },
  { label: 'Appointments', value: '25,000+', icon: CalendarCheck },
] as const

export const FEATURES = [
  {
    title: 'Appointment Scheduling',
    description: 'Smart calendars, slot management, and instant confirmations for every clinic role.',
    icon: CalendarCheck,
  },
  {
    title: 'Patient Records',
    description: 'Secure, searchable profiles with visit history and clinical notes in one place.',
    icon: ClipboardList,
  },
  {
    title: 'Doctor Management',
    description: 'Roster, specialties, availability, and approvals—built for busy care teams.',
    icon: Stethoscope,
  },
  {
    title: 'Secure Healthcare Data',
    description: 'Role-based access, encrypted sessions, and audit-friendly workflows.',
    icon: Lock,
  },
] as const

export const STEPS = [
  {
    step: '01',
    title: 'Create Account',
    description: 'Sign up as a patient, doctor, or clinic admin in minutes.',
    icon: UserPlus,
  },
  {
    step: '02',
    title: 'Book Appointment',
    description: 'Pick a specialist, choose an open slot, and confirm instantly.',
    icon: CalendarCheck,
  },
  {
    step: '03',
    title: 'Manage Healthcare Easily',
    description: 'Track visits, records, and clinic operations from one dashboard.',
    icon: ClipboardList,
  },
] as const

const AVATAR_GRADIENTS = [
  'from-violet-500 to-indigo-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
] as const

export const FEATURED_DOCTORS = DEMO_DOCTORS.slice(0, 4).map((doc, i) => ({
  name: doc.name,
  specialty: doc.specialty,
  rating: 4.8 + (i % 3) * 0.1,
  availability: i % 2 === 0 ? 'Available today' : 'Next slot: Tomorrow',
  initials: doc.name
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
  gradient: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
}))

export const TESTIMONIALS = [
  {
    quote:
      'ClinicSync cut our front-desk calls in half. Patients book online and we see everything in one dashboard.',
    name: 'Maria Santos',
    role: 'Clinic Director',
    org: 'Harborview Family Clinic',
    initials: 'MS',
  },
  {
    quote:
      'I finally have a clear view of my schedule and pending approvals without juggling spreadsheets.',
    name: 'Dr. James Okonkwo',
    role: 'Pediatrician',
    org: 'ClinicSync Partner',
    initials: 'JO',
  },
  {
    quote:
      'Booking took under two minutes. I got reminders and my records were already there at check-in.',
    name: 'Alex Morgan',
    role: 'Patient',
    org: 'Portland, OR',
    initials: 'AM',
  },
] as const

export const FOOTER_LINKS = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Doctors', href: '#doctors' },
  ],
  company: [
    { label: 'About', href: '#contact' },
    { label: 'Contact', href: '#contact' },
    { label: 'Privacy', href: '#contact' },
  ],
  portals: [
    { label: 'Patient login', href: '/login/patient' },
    { label: 'Doctor login', href: '/login/doctor' },
    { label: 'Admin login', href: '/login/admin' },
  ],
} as const
