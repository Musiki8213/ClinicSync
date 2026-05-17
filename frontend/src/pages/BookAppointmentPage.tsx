import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useSearchParams } from 'react-router-dom'
import { CalendarIcon } from 'lucide-react'
import api from '@/api/client'
import { fetchDoctors, type Doctor } from '@/services/doctors'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { pageSubtitleClass, pageTitleClass } from '@/lib/pageStyles'
import { isAxiosError } from 'axios'

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams()
  const preDoctor = searchParams.get('doctor') || ''

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorId, setDoctorId] = useState<string>('')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [slots, setSlots] = useState<string[]>([])
  const [time, setTime] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const dateStr = useMemo(() => (date ? format(date, 'yyyy-MM-dd') : ''), [date])

  useEffect(() => {
    if (!dateStr) return
    let cancelled = false
    void (async () => {
      setLoadingDoctors(true)
      try {
        const list = await fetchDoctors({ date: dateStr, availableOnly: true })
        if (!cancelled) setDoctors(list)
      } catch {
        if (!cancelled) {
          toast({ title: 'Could not load doctors', variant: 'destructive' })
          setDoctors([])
        }
      } finally {
        if (!cancelled) setLoadingDoctors(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [dateStr])

  useEffect(() => {
    if (!doctors.length) {
      setDoctorId('')
      return
    }
    if (preDoctor && doctors.some((d) => d._id === preDoctor)) {
      setDoctorId(preDoctor)
      return
    }
    const first = doctors[0]._id
    if (!doctorId || !doctors.some((d) => d._id === doctorId)) setDoctorId(first)
  }, [doctors, doctorId, preDoctor])

  useEffect(() => {
    if (!doctorId || !dateStr) {
      setSlots([])
      setTime('')
      return
    }
    let cancelled = false
    ;(async () => {
      setLoadingSlots(true)
      setTime('')
      try {
        const { data } = await api.get<{ slots: string[] }>(`/doctors/${doctorId}/slots`, { params: { date: dateStr } })
        if (!cancelled) setSlots(data.slots || [])
      } catch {
        if (!cancelled) setSlots([])
      } finally {
        if (!cancelled) setLoadingSlots(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [doctorId, dateStr])

  async function onBook(e: React.FormEvent) {
    e.preventDefault()
    if (!doctorId || !dateStr || !time) {
      toast({ title: 'Pick doctor, date, and time', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      await api.post('/appointments', { doctorId, date: dateStr, time, notes })
      toast({ title: 'Booking successful', description: 'Your request is pending approval.', variant: 'success' })
      setNotes('')
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined
      toast({ title: 'Booking failed', description: msg, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className={pageTitleClass}>Book appointment</h1>
        <p className={pageSubtitleClass}>Pick a date first—only doctors with open slots that day are listed</p>
      </div>
      {loadingDoctors ? (
        <p className="text-sm text-muted-foreground">Loading doctors…</p>
      ) : doctors.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
          No doctors have open slots on this date. Try another day or pick a different clinician.
        </p>
      ) : null}
      <form onSubmit={onBook}>
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>Visit details</CardTitle>
            <CardDescription>Slots respect each doctor&apos;s weekly availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select value={doctorId || undefined} onValueChange={setDoctorId} disabled={!doctors.length}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.fullName} — {d.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start rounded-xl text-left font-normal')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Time slot</Label>
                <div className="min-h-[120px] rounded-xl border bg-muted/20 p-3">
                  {!doctorId ? (
                    <p className="text-sm text-muted-foreground">Select a doctor to load open times.</p>
                  ) : loadingSlots ? (
                    <p className="text-sm text-muted-foreground">Loading slots…</p>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No open slots for this day.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {slots.map((s) => (
                        <Button
                          key={s}
                          type="button"
                          variant={time === s ? 'default' : 'outline'}
                          size="sm"
                          className="rounded-lg"
                          onClick={() => setTime(s)}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-xl" rows={3} />
            </div>
            <Button type="submit" className="rounded-xl" disabled={submitting || !doctors.length}>
              {submitting ? 'Submitting…' : 'Request appointment'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
