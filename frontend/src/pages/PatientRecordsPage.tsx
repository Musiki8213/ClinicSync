import { useCallback, useEffect, useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/api/client'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { isAxiosError } from 'axios'
import { format } from 'date-fns'
import { pageSubtitleClass, pageTitleClass } from '@/lib/pageStyles'

interface PatientRow {
  _id: string
  name: string
  age?: number
  gender?: string
  medicalHistory?: string
}

interface DoctorOpt {
  _id: string
  fullName: string
}

interface PatientDetail extends PatientRow {
  medicalNotes: Array<{
    _id: string
    content: string
    createdAt: string
    doctor?: { fullName: string }
  }>
}

export default function PatientRecordsPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<PatientRow[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [active, setActive] = useState<PatientDetail | null>(null)
  const [note, setNote] = useState('')
  const [doctors, setDoctors] = useState<DoctorOpt[]>([])
  const [noteDoctorId, setNoteDoctorId] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<{ patients: PatientRow[]; pagination: { pages: number } }>('/patients', {
        params: { page, limit: 8, search: search || undefined },
      })
      setRows(data.patients)
      setPages(data.pagination.pages || 1)
    } catch {
      toast({ title: 'Could not load patients', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (user?.role !== 'admin') return
    void (async () => {
      try {
        const { data } = await api.get<{ doctors: DoctorOpt[] }>('/doctors')
        setDoctors(data.doctors)
        if (data.doctors[0]) setNoteDoctorId(data.doctors[0]._id)
      } catch {
        /* ignore */
      }
    })()
  }, [user?.role])

  async function openSheet(id: string) {
    try {
      const { data } = await api.get<{ patient: PatientDetail }>(`/patients/${id}`)
      setActive(data.patient)
      setNote('')
      setSheetOpen(true)
    } catch {
      toast({ title: 'Could not open record', variant: 'destructive' })
    }
  }

  async function saveNote(e: React.FormEvent) {
    e.preventDefault()
    if (!active) return
    setSavingNote(true)
    try {
      const body =
        user?.role === 'admin' ? { content: note, doctorId: noteDoctorId } : { content: note }
      await api.post(`/patients/${active._id}/notes`, body)
      toast({ title: 'Note saved', variant: 'success' })
      setNote('')
      const { data } = await api.get<{ patient: PatientDetail }>(`/patients/${active._id}`)
      setActive(data.patient)
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined
      toast({ title: 'Save failed', description: msg, variant: 'destructive' })
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={pageTitleClass}>Patient records</h1>
        <p className={pageSubtitleClass}>Search the directory and add consultation notes</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-0 flex-1 sm:min-w-[12rem]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="rounded-xl pl-9"
            placeholder="Search name or history"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button className="w-full rounded-xl sm:w-auto" type="button" onClick={() => { setPage(1); void load() }}>
          Apply
        </Button>
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="space-y-3 p-4 md:hidden">
              {rows.map((p) => (
                <div key={p._id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{p.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {p.age != null ? `${p.age} yrs` : 'Age —'} · {p.gender || '—'}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {p.medicalHistory || 'No history recorded'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="shrink-0 rounded-lg"
                      type="button"
                      onClick={() => void openSheet(p._id)}
                    >
                      <FileText className="size-3.5" />
                      <span className="sr-only">Notes</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead className="hidden lg:table-cell">Gender</TableHead>
                <TableHead className="hidden lg:table-cell">History</TableHead>
                <TableHead className="w-[120px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.age ?? '—'}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline">{p.gender || '—'}</Badge>
                  </TableCell>
                  <TableCell className="hidden max-w-xs truncate text-muted-foreground lg:table-cell">
                    {p.medicalHistory || '—'}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="secondary" className="rounded-lg" type="button" onClick={() => void openSheet(p._id)}>
                      <FileText className="mr-1 h-3.5 w-3.5" />
                      Notes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
              </Table>
            </div>
          </>
        )}
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Page {page}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{active?.name}</SheetTitle>
            <SheetDescription>Medical notes visible to care team</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm font-medium">Medical history</p>
              <p className="text-sm text-muted-foreground">{active?.medicalHistory || 'None recorded'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Previous notes</p>
              <ul className="space-y-2 text-sm">
                {active?.medicalNotes?.map((n) => (
                  <li key={n._id} className="rounded-lg border bg-muted/30 p-3">
                    <p>{n.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {n.doctor?.fullName} · {format(new Date(n.createdAt), 'PPp')}
                    </p>
                  </li>
                ))}
                {!active?.medicalNotes?.length && <li className="text-muted-foreground">No notes yet.</li>}
              </ul>
            </div>
            <form className="space-y-3" onSubmit={saveNote}>
              {user?.role === 'admin' && (
                <div className="space-y-2">
                  <Label>Attributing doctor</Label>
                  <Select value={noteDoctorId} onValueChange={setNoteDoctorId}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d._id} value={d._id}>
                          {d.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="note">New note</Label>
                <Textarea id="note" required value={note} onChange={(e) => setNote(e.target.value)} className="rounded-xl" rows={4} />
              </div>
              <Button type="submit" className="rounded-xl" disabled={savingNote}>
                {savingNote ? 'Saving…' : 'Save note'}
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
