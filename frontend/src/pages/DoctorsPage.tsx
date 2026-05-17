import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Search, Stethoscope } from 'lucide-react'
import { fetchDoctors, type Doctor } from '@/services/doctors'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

function formatAvailabilitySummary(availability: Doctor['availability']) {
  if (!availability?.length) return 'Schedule on request'
  const days = [...new Set(availability.map((a) => a.day?.slice(0, 3)))].join(', ')
  return `${days} · slots ${availability[0]?.startTime ?? '—'}–${availability[0]?.endTime ?? '—'}`
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const initials = doctor.fullName
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg leading-tight">{doctor.fullName}</CardTitle>
              <Badge variant="secondary" className="shrink-0 capitalize">
                {doctor.specialization}
              </Badge>
            </div>
            <CardDescription className="mt-1 flex items-center gap-1.5 text-xs">
              <Stethoscope className="h-3.5 w-3.5" />
              {doctor.yearsOfExperience ?? 0} yrs experience
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-1 flex-col gap-3 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="leading-snug">{formatAvailabilitySummary(doctor.availability)}</p>
        </div>
        <Button asChild variant="outline" className="w-full rounded-xl">
          <Link to={`/app/doctors/${doctor._id}`}>View profile</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function DoctorsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex gap-4 p-6">
            <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-muted" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="space-y-3 px-6 pb-6">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-9 w-full animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DoctorsPage() {
  const [list, setList] = useState<Doctor[]>([])
  const [specializations, setSpecializations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [spec, setSpec] = useState<string>('all')

  async function load() {
    setLoading(true)
    try {
      const doctors = await fetchDoctors({
        search: search.trim() || undefined,
        specialization: spec === 'all' ? undefined : spec,
        availableOnly: true,
      })
      setList(doctors)
    } catch {
      toast({ title: 'Could not load doctors', variant: 'destructive' })
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        const all = await fetchDoctors({ availableOnly: true })
        setSpecializations([...new Set(all.map((d) => d.specialization))].sort())
      } catch {
        setSpecializations([])
      }
    })()
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Doctors</h1>
        <p className="text-muted-foreground">Browse clinicians who currently have bookable hours.</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-0 flex-1 sm:min-w-[12rem]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or specialty"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void load()}
            className="rounded-xl pl-9"
          />
        </div>
        <Select value={spec} onValueChange={setSpec}>
          <SelectTrigger className="w-full max-w-xs rounded-xl">
            <SelectValue placeholder="Specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All specialties</SelectItem>
            {specializations.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" variant="secondary" className="rounded-xl" onClick={() => void load()}>
          Apply
        </Button>
      </div>

      {loading ? (
        <DoctorsSkeleton />
      ) : list.length === 0 ? (
        <div
          className={cn(
            'rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center',
            'text-muted-foreground'
          )}
        >
          <p className="font-medium text-foreground">No available doctors match your filters</p>
          <p className="mt-1 text-sm">Try another specialty or clear the search.</p>
          <p className="mt-4 text-sm">
            If the clinic roster is empty, run <code className="rounded bg-muted px-1">npm run seed</code> in the
            backend and restart the API.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => (
            <DoctorCard key={d._id} doctor={d} />
          ))}
        </div>
      )}
    </div>
  )
}
