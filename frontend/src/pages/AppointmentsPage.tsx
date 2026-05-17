import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { AppointmentRowMenu } from '@/components/appointments/AppointmentRowMenu'
import { pageSubtitleClass, pageTitleClass } from '@/lib/pageStyles'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/api/client'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { isAxiosError } from 'axios'

type AppointmentStatus = 'pending' | 'approved' | 'completed' | 'cancelled'

interface AppointmentRow {
  _id: string
  date: string
  time: string
  status: AppointmentStatus
  notes?: string
  patient: { _id: string; name: string }
  doctor: { _id: string; fullName: string; specialization?: string }
}

function statusVariant(s: AppointmentStatus): 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline' {
  switch (s) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    case 'completed':
      return 'secondary'
    case 'cancelled':
      return 'destructive'
    default:
      return 'outline'
  }
}

export default function AppointmentsPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState<AppointmentRow[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: 8 }
      if (statusFilter !== 'all') params.status = statusFilter
      const { data } = await api.get<{ appointments: AppointmentRow[]; pagination: { pages: number; total: number } }>(
        '/appointments',
        { params }
      )
      setRows(data.appointments)
      setPages(data.pagination.pages || 1)
      setTotal(data.pagination.total)
    } catch {
      toast({ title: 'Could not load appointments', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  async function patchStatus(id: string, status: AppointmentStatus) {
    try {
      await api.patch(`/appointments/${id}/status`, { status })
      toast({ title: 'Updated', description: `Status set to ${status}`, variant: 'success' })
      void load()
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined
      toast({ title: 'Update failed', description: msg, variant: 'destructive' })
    }
  }

  async function cancelAppt(id: string) {
    try {
      await api.patch(`/appointments/${id}/cancel`)
      toast({ title: 'Cancelled', variant: 'success' })
      void load()
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined
      toast({ title: 'Could not cancel', description: msg, variant: 'destructive' })
    }
  }

  const isToday = (d: string) => {
    const t = new Date()
    const x = new Date(d)
    return t.toDateString() === x.toDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={pageTitleClass}>Appointments</h1>
          <p className={pageSubtitleClass}>
            {user?.role === 'doctor'
              ? 'Review your patients’ requests and approve or complete visits'
              : 'Filter, approve, and track every visit'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => { setPage(1); setStatusFilter(v) }}>
            <SelectTrigger className="w-full min-w-0 rounded-xl sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {user?.role === 'doctor' || user?.role === 'admin' ? (
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Daily schedule</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.filter((r) => isToday(r.date) && r.status !== 'cancelled').length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments for today in this page.</p>
            ) : (
              rows
                .filter((r) => isToday(r.date) && r.status !== 'cancelled')
                .map((r) => (
                  <Card key={r._id} className="rounded-xl border bg-muted/20">
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{r.patient?.name}</p>
                          <p className="text-sm text-muted-foreground">{r.time}</p>
                        </div>
                        <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.doctor?.fullName}</p>
                    </CardContent>
                  </Card>
                ))
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">All records ({total})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {rows.map((r) => (
                  <div key={r._id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{r.patient?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(r.date), 'MMM d, yyyy')} · {r.time}
                        </p>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{r.doctor?.fullName}</p>
                      </div>
                      <div className="flex shrink-0 items-start gap-1">
                        <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                        <AppointmentRowMenu row={r} onPatch={patchStatus} onCancel={cancelAppt} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead className="hidden lg:table-cell">Doctor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[70px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r._id}>
                        <TableCell>{format(new Date(r.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{r.time}</TableCell>
                        <TableCell>{r.patient?.name}</TableCell>
                        <TableCell className="hidden lg:table-cell">{r.doctor?.fullName}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <AppointmentRowMenu row={r} onPatch={patchStatus} onCancel={cancelAppt} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {pages || 1}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
