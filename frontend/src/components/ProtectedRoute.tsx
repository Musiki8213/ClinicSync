import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute() {
  const { user, loading, signingOut } = useAuth()
  const location = useLocation()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  if (!user) {
    if (signingOut) return null
    return <Navigate to="/login/patient" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
