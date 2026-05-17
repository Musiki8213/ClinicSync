import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { MAX_DOCTORS } from '@/data/demoAccounts'
import { SPECIALIZATION_OPTIONS, WEEKDAY_OPTIONS } from '@/data/clinicalDirectory'
import {
  defaultAvailability,
  fetchDoctors,
  updateDoctor,
  type Doctor,
  type DoctorAvailability,
} from '@/services/doctors'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { isAxiosError } from 'axios'
import { pageSubtitleClass, pageTitleClass } from '@/lib/pageStyles'

type FormState = {
  fullName: string
  email: string
  password: string
  phoneNumber: string
  specialization: string
  yearsOfExperience: number
  gender: string
  bio: string
  availability: DoctorAvailability[]
}

function doctorToForm(d: Doctor): FormState {
  return {
    fullName: d.fullName,
    email: d.email,
    password: '',
    phoneNumber: d.phoneNumber ?? '',
    specialization: d.specialization,
    yearsOfExperience: d.yearsOfExperience ?? 0,
    gender: d.gender ?? 'prefer_not_to_say',
    bio: d.bio ?? '',
    availability: d.availability?.length ? d.availability.map((a) => ({ ...a })) : defaultAvailability(),
  }
}

export default function AdminDoctorsPage() {
  const [rows, setRows] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchDoctors({ availableOnly: false })
      setRows(list)
    } catch {
      toast({ title: 'Could not load doctors', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function openEdit(d: Doctor) {
    setEditingId(d._id)
    setForm(doctorToForm(d))
    setFormOpen(true)
  }

  function setAvailability(next: DoctorAvailability[]) {
    setForm((f) => (f ? { ...f, availability: next } : f))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId || !form) return
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        specialization: form.specialization,
        yearsOfExperience: form.yearsOfExperience,
        gender: form.gender,
        profileImage: '',
        bio: form.bio,
        availability: form.availability,
      }
      if (form.password.trim()) payload.password = form.password
      await updateDoctor(editingId, payload)
      toast({ title: 'Doctor updated', variant: 'success' })
      setFormOpen(false)
      void load()
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined
      toast({ title: 'Update failed', description: msg, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={pageTitleClass}>Doctor registry</h1>
        <p className={pageSubtitleClass}>
          Fixed roster of {MAX_DOCTORS} clinicians—each has their own login to manage appointments.
        </p>
      </div>

      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Clinic doctors ({MAX_DOCTORS})</CardTitle>
          <CardDescription>
            Only these accounts appear under Doctors and can sign in. Restart the API or run{' '}
            <code className="rounded bg-muted px-1">npm run seed</code> to restore the roster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No doctors found. Run <code className="rounded bg-muted px-1">npm run seed</code> in the backend folder,
              then restart the API.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Login email</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead className="hidden md:table-cell">Experience</TableHead>
                    <TableHead className="w-[70px] text-right">Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((d) => (
                    <TableRow key={d._id}>
                      <TableCell className="font-medium">{d.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{d.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{d.specialization}</Badge>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {d.yearsOfExperience ?? 0} yrs
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => openEdit(d)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit doctor</DialogTitle>
            <DialogDescription>
              Update profile and schedule. Leave password blank to keep the current login password.
            </DialogDescription>
          </DialogHeader>
          {form && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="adm-full">Full name</Label>
                  <Input
                    id="adm-full"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm((f) => (f ? { ...f, fullName: e.target.value } : f))}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="adm-email">Login email</Label>
                  <Input id="adm-email" type="email" readOnly value={form.email} className="rounded-xl bg-muted/50" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adm-phone">Phone</Label>
                  <Input
                    id="adm-phone"
                    value={form.phoneNumber}
                    onChange={(e) => setForm((f) => (f ? { ...f, phoneNumber: e.target.value } : f))}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="adm-pass2">New password (optional)</Label>
                  <Input
                    id="adm-pass2"
                    type="password"
                    minLength={6}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm((f) => (f ? { ...f, password: e.target.value } : f))}
                    className="rounded-xl"
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Specialization</Label>
                  <Select
                    value={form.specialization}
                    onValueChange={(v) => setForm((f) => (f ? { ...f, specialization: v } : f))}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATION_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adm-yoe">Years of experience</Label>
                  <Input
                    id="adm-yoe"
                    type="number"
                    min={0}
                    max={70}
                    value={form.yearsOfExperience}
                    onChange={(e) =>
                      setForm((f) =>
                        f ? { ...f, yearsOfExperience: Math.max(0, Number(e.target.value) || 0) } : f
                      )
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm((f) => (f ? { ...f, gender: v } : f))}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="adm-bio">Bio</Label>
                  <Textarea
                    id="adm-bio"
                    value={form.bio}
                    onChange={(e) => setForm((f) => (f ? { ...f, bio: e.target.value } : f))}
                    className="rounded-xl"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Weekly availability</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() =>
                      setAvailability([
                        ...form.availability,
                        { day: 'monday', startTime: '09:00', endTime: '17:00', slotMinutes: 30 },
                      ])
                    }
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add row
                  </Button>
                </div>
                <div className="space-y-2 rounded-xl border bg-muted/20 p-3">
                  {form.availability.map((row, idx) => (
                    <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
                      <div className="min-w-0 flex-1 sm:min-w-[8rem]">
                        <Select
                          value={row.day}
                          onValueChange={(v) => {
                            const next = [...form.availability]
                            next[idx] = { ...next[idx], day: v }
                            setAvailability(next)
                          }}
                        >
                          <SelectTrigger className="rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WEEKDAY_OPTIONS.map((d) => (
                              <SelectItem key={d.value} value={d.value}>
                                {d.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        type="time"
                        className="w-full rounded-lg sm:w-[7.5rem]"
                        value={row.startTime}
                        onChange={(e) => {
                          const next = [...form.availability]
                          next[idx] = { ...next[idx], startTime: e.target.value }
                          setAvailability(next)
                        }}
                      />
                      <Input
                        type="time"
                        className="w-full rounded-lg sm:w-[7.5rem]"
                        value={row.endTime}
                        onChange={(e) => {
                          const next = [...form.availability]
                          next[idx] = { ...next[idx], endTime: e.target.value }
                          setAvailability(next)
                        }}
                      />
                      <Select
                        value={String(row.slotMinutes ?? 30)}
                        onValueChange={(v) => {
                          const next = [...form.availability]
                          next[idx] = { ...next[idx], slotMinutes: Number(v) }
                          setAvailability(next)
                        }}
                      >
                        <SelectTrigger className="w-full rounded-lg sm:w-[6.25rem]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="45">45 min</SelectItem>
                          <SelectItem value="60">60 min</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 rounded-lg"
                        onClick={() => setAvailability(form.availability.filter((_, i) => i !== idx))}
                        aria-label="Remove row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
