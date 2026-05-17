import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ClipboardList, Stethoscope, UserRound, Activity } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { pageSubtitleClass, pageTitleClass } from '@/lib/pageStyles'

type AdminStats = {
  totalDoctors: number
  totalPatients: number
  totalAppointments: number
  upcomingAppointments: number
  pendingApprovals: number
  todayAppointments: number
}

type DoctorStats = {
  todayAppointments: number
  pendingAppointments: number
  completedConsultations: number
}

type PatientStats = {
  upcomingAppointments: number
  pastAppointments: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | DoctorStats | PatientStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/dashboard/stats')
        if (!cancelled) setStats(data as AdminStats & DoctorStats & PatientStats)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading || !user) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className={pageTitleClass}>Dashboard</h1>
        <p className={pageSubtitleClass}>Overview tailored to your role</p>
      </div>

      {user.role === 'admin' && stats && 'totalDoctors' in stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total patients" value={stats.totalPatients} icon={UserRound} />
            <StatCard title="Today's appointments" value={stats.todayAppointments} icon={CalendarDays} />
            <StatCard title="Pending approvals" value={stats.pendingApprovals} icon={ClipboardList} accent />
            <StatCard title="Total doctors" value={stats.totalDoctors} icon={Stethoscope} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Operations</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button asChild className="rounded-xl">
                  <Link to="/app/appointments">Review appointments</Link>
                </Button>
                <Button variant="outline" asChild className="rounded-xl">
                  <Link to="/app/doctors">Manage doctors</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-dashed bg-muted/30 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-primary" />
                  Quick analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">All appointments</p>
                  <p className="text-2xl font-semibold">{stats.totalAppointments}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Upcoming (active)</p>
                  <p className="text-2xl font-semibold">{stats.upcomingAppointments}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {user.role === 'doctor' && stats && 'completedConsultations' in stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Today" value={stats.todayAppointments} icon={CalendarDays} />
          <StatCard title="Pending" value={stats.pendingAppointments} icon={ClipboardList} accent />
          <StatCard title="Completed" value={stats.completedConsultations} icon={Activity} />
        </div>
      )}

      {user.role === 'patient' && stats && 'pastAppointments' in stats && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard title="Upcoming" value={stats.upcomingAppointments} icon={CalendarDays} />
            <StatCard title="Past" value={stats.pastAppointments} icon={ClipboardList} />
          </div>
          <Card className="flex flex-col justify-center rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle>Need a visit?</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="rounded-xl">
                <Link to="/app/book">Book new appointment</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  accent?: boolean
}) {
  return (
    <Card className={`rounded-xl shadow-sm ${accent ? 'border-primary/30 bg-primary/5' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold sm:text-3xl">{value}</p>
      </CardContent>
    </Card>
  )
}
