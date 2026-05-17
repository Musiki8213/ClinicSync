export const SPECIALIZATION_OPTIONS = [
  'Cardiology',
  'Pediatrics',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'General Practice',
  'Psychiatry',
  'Oncology',
  'Radiology',
  'Endocrinology',
] as const

export type SpecializationOption = (typeof SPECIALIZATION_OPTIONS)[number]

export const WEEKDAY_OPTIONS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
] as const
