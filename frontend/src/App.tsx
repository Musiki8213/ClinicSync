import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from '@/components/ui/toaster'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RoleRoute } from '@/components/RoleRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import AppointmentsPage from '@/pages/AppointmentsPage'
import BookAppointmentPage from '@/pages/BookAppointmentPage'
import DoctorsPage from '@/pages/DoctorsPage'
import DoctorDetailPage from '@/pages/DoctorDetailPage'
import AdminDoctorsPage from '@/pages/AdminDoctorsPage'
import PatientRecordsPage from '@/pages/PatientRecordsPage'
import ProfilePage from '@/pages/ProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  if (user) {
    return <Navigate to="/app/dashboard" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Navigate to="/login/patient" replace />} />
      <Route
        path="/login/patient"
        element={
          <GuestRoute>
            <LoginPage portal="patient" />
          </GuestRoute>
        }
      />
      <Route
        path="/login/doctor"
        element={
          <GuestRoute>
            <LoginPage portal="doctor" />
          </GuestRoute>
        }
      />
      <Route
        path="/login/admin"
        element={
          <GuestRoute>
            <LoginPage portal="admin" />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <SignupPage />
          </GuestRoute>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route
            path="book"
            element={
              <RoleRoute roles={['patient']}>
                <BookAppointmentPage />
              </RoleRoute>
            }
          />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="doctors/:id" element={<DoctorDetailPage />} />
          <Route
            path="admin/doctors"
            element={
              <RoleRoute roles={['admin']}>
                <AdminDoctorsPage />
              </RoleRoute>
            }
          />
          <Route
            path="patients"
            element={
              <RoleRoute roles={['admin', 'doctor']}>
                <PatientRecordsPage />
              </RoleRoute>
            }
          />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}
