import api from '@/api/client'

export interface DoctorAvailability {
  day: string
  startTime: string
  endTime: string
  slotMinutes?: number
}

export interface Doctor {
  _id: string
  fullName: string
  email: string
  phoneNumber?: string
  specialization: string
  yearsOfExperience?: number
  gender?: string
  availability: DoctorAvailability[]
  profileImage?: string
  bio?: string
  createdAt?: string
  updatedAt?: string
  user?: { email: string; name: string }
}

export interface CreateDoctorPayload {
  fullName: string
  email: string
  password: string
  phoneNumber?: string
  specialization: string
  yearsOfExperience?: number
  gender?: string
  availability?: DoctorAvailability[]
  profileImage?: string
  bio?: string
}

export type UpdateDoctorPayload = Partial<
  Omit<CreateDoctorPayload, 'password'> & { password?: string }
>

export async function fetchDoctors(params?: {
  specialization?: string
  search?: string
  /** YYYY-MM-DD — only doctors with open slots that day */
  date?: string
  /** When true (default for patients), omit doctors without weekly hours */
  availableOnly?: boolean
}) {
  const query: Record<string, string> = {}
  if (params?.specialization) query.specialization = params.specialization
  if (params?.search) query.search = params.search
  if (params?.date) query.date = params.date
  query.availableOnly = params?.availableOnly === false ? 'false' : 'true'

  const { data } = await api.get<{ doctors: Doctor[] }>('/doctors', { params: query })
  return data.doctors
}

export async function fetchDoctorById(id: string) {
  const { data } = await api.get<{ doctor: Doctor }>(`/doctors/${id}`)
  return data.doctor
}

export async function createDoctor(payload: CreateDoctorPayload) {
  const { data } = await api.post<{ doctor: Doctor }>('/doctors', payload)
  return data.doctor
}

export async function updateDoctor(id: string, payload: UpdateDoctorPayload) {
  const { data } = await api.put<{ doctor: Doctor }>(`/doctors/${id}`, payload)
  return data.doctor
}

export async function deleteDoctor(id: string) {
  await api.delete(`/doctors/${id}`)
}

export function defaultAvailability(): DoctorAvailability[] {
  return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map((day) => ({
    day,
    startTime: '09:00',
    endTime: '17:00',
    slotMinutes: 30,
  }))
}
