import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Mail, Phone, Stethoscope } from 'lucide-react'
import { fetchDoctorById, type Doctor } from '@/services/doctors'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'

const dayLabels: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const d = await fetchDoctorById(id)
        if (!cancelled) {
          setDoctor(d)
        }
      } catch {
        if (!cancelled) {
          toast({ title: 'Doctor not found', variant: 'destructive' })
          setDoctor(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="flex gap-6 rounded-xl border bg-card p-6">
          <div className="h-20 w-20 shrink-0 animate-pulse rounded-2xl bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-muted-foreground">This profile could not be loaded.</p>
        <Button asChild variant="outline" className="mt-4 rounded-xl">
          <Link to="/app/doctors">Back to doctors</Link>
        </Button>
      </div>
    )
  }

  const initials = doctor.fullName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" className="-ml-2 gap-2 rounded-xl" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start md:p-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl font-semibold text-primary md:h-24 md:w-24 md:text-4xl">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {doctor.specialization}
              </Badge>
              {doctor.gender && doctor.gender !== 'prefer_not_to_say' && (
                <Badge variant="outline" className="capitalize">
                  {doctor.gender.replace('_', ' ')}
                </Badge>
              )}
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{doctor.fullName}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Stethoscope className="h-4 w-4" />
              {doctor.yearsOfExperience ?? 0} years of experience
            </p>
            <Separator className="my-6" />
            <div className="space-y-2 text-sm">
              {doctor.email && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href={`mailto:${doctor.email}`} className="text-foreground underline-offset-4 hover:underline">
                    {doctor.email}
                  </a>
                </p>
              )}
              {doctor.phoneNumber && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  {doctor.phoneNumber}
                </p>
              )}
            </div>
            {doctor.bio && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{doctor.bio}</p>}
            {user?.role === 'patient' && (
              <Button
                className="mt-6 w-full rounded-xl sm:w-auto"
                onClick={() => navigate(`/app/book?doctor=${doctor._id}`)}
              >
                Book appointment
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Weekly availability
          </CardTitle>
          <CardDescription>Typical hours shown in the clinic schedule (subject to change).</CardDescription>
        </CardHeader>
        <CardContent>
          {!doctor.availability?.length ? (
            <p className="text-sm text-muted-foreground">No weekly pattern on file—contact the clinic for times.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead className="hidden sm:table-cell">Slot length</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctor.availability.map((row, idx) => (
                  <TableRow key={`${row.day}-${idx}`}>
                    <TableCell className="font-medium">{dayLabels[row.day] ?? row.day}</TableCell>
                    <TableCell>{row.startTime}</TableCell>
                    <TableCell>{row.endTime}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {row.slotMinutes ?? 30} min
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/app/doctors">View all doctors</Link>
        </Button>
      </div>
    </div>
  )
}
