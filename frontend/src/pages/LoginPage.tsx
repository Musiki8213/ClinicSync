import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, type Role } from '@/contexts/AuthContext'
import {
  DEMO_ADMIN,
  DEMO_DOCTOR_PASSWORD,
  DEMO_DOCTORS,
  DEMO_PATIENT_PASSWORD,
  DEMO_PATIENTS,
  type LoginPortalRole,
} from '@/data/demoAccounts'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isAxiosError } from 'axios'

const PORTAL_COPY: Record<
  LoginPortalRole,
  { title: string; description: string; expectedRole: Role; wrongPortalMessage: string }
> = {
  patient: {
    title: 'Patient sign in',
    description: 'Sign in with your patient account to book and manage appointments.',
    expectedRole: 'patient',
    wrongPortalMessage: 'That account is not a patient. Use doctor or admin sign-in instead.',
  },
  doctor: {
    title: 'Doctor sign in',
    description: 'Clinic doctors sign in here to review and approve appointments.',
    expectedRole: 'doctor',
    wrongPortalMessage: 'That account is not a doctor. Use patient or admin sign-in instead.',
  },
  admin: {
    title: 'Admin sign in',
    description: 'Clinic administrators sign in here to manage the registry and operations.',
    expectedRole: 'admin',
    wrongPortalMessage: 'That account is not an administrator. Use patient or doctor sign-in instead.',
  },
}

type LoginPageProps = {
  portal: LoginPortalRole
}

export default function LoginPage({ portal }: LoginPageProps) {
  const { login, clearSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/app/dashboard'
  const copy = PORTAL_COPY[portal]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function fillDemo(accountEmail: string, accountPassword: string) {
    setEmail(accountEmail)
    setPassword(accountPassword)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const user = await login(email, password)
      if (user.role !== copy.expectedRole) {
        clearSession()
        toast({
          title: 'Wrong sign-in page',
          description: copy.wrongPortalMessage,
          variant: 'destructive',
        })
        return
      }
      toast({ title: 'Welcome back', description: `Signed in as ${user.name}` })
      navigate(from, { replace: true })
    } catch (err) {
      const desc =
        isAxiosError(err) && !err.response
          ? 'Cannot reach the API. Start MongoDB, run the backend (npm run dev in backend/), and use Vite dev or preview so /api is proxied—or set VITE_API_URL in frontend/.env.'
          : isAxiosError(err)
            ? (err.response?.data as { message?: string })?.message
            : undefined
      toast({ title: 'Login failed', description: desc || 'Check your credentials', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl">{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {portal === 'patient' && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              New patient?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Create account
              </Link>
            </p>
          )}

          <div className="mt-6 space-y-2 rounded-xl border bg-muted/30 p-4">
            <p className="text-xs font-medium text-foreground">Quick fill</p>
            {portal === 'patient' && (
              <ul className="space-y-1">
                {DEMO_PATIENTS.map((p) => (
                  <li key={p.email}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto w-full justify-start rounded-lg px-2 py-1.5 text-left text-xs font-normal text-muted-foreground"
                      onClick={() => fillDemo(p.email, DEMO_PATIENT_PASSWORD)}
                    >
                      <span className="font-medium text-foreground">{p.name}</span>
                      <span className="ml-1">— {p.email}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {portal === 'doctor' && (
              <ul className="space-y-1">
                {DEMO_DOCTORS.map((d) => (
                  <li key={d.email}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto w-full justify-start rounded-lg px-2 py-1.5 text-left text-xs font-normal text-muted-foreground"
                      onClick={() => fillDemo(d.email, DEMO_DOCTOR_PASSWORD)}
                    >
                      <span className="font-medium text-foreground">{d.name}</span>
                      <span className="ml-1">— {d.email}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {portal === 'admin' && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-auto w-full justify-start rounded-lg px-3 py-2 text-left text-xs font-normal text-muted-foreground"
                onClick={() => fillDemo(DEMO_ADMIN.email, DEMO_ADMIN.password)}
              >
                <span className="font-medium text-foreground">Clinic Admin</span>
                <span className="ml-1">— {DEMO_ADMIN.email}</span>
              </Button>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {portal !== 'patient' && (
              <>
                <Link to="/login/patient" className="font-medium text-primary hover:underline">
                  Patient sign in
                </Link>
                {' · '}
              </>
            )}
            {portal !== 'doctor' && (
              <>
                <Link to="/login/doctor" className="font-medium text-primary hover:underline">
                  Doctor sign in
                </Link>
                {' · '}
              </>
            )}
            {portal !== 'admin' && (
              <Link to="/login/admin" className="font-medium text-primary hover:underline">
                Admin sign in
              </Link>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
