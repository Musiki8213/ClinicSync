import { MoreHorizontal } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type AppointmentStatus = 'pending' | 'approved' | 'completed' | 'cancelled'

export interface AppointmentRowData {
  _id: string
  status: AppointmentStatus
}

export function AppointmentRowMenu({
  row,
  onPatch,
  onCancel,
}: {
  row: AppointmentRowData
  onPatch: (id: string, status: AppointmentStatus) => void
  onCancel: (id: string) => void
}) {
  const { user } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-10 shrink-0 rounded-lg">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {(user?.role === 'admin' || user?.role === 'doctor') && row.status === 'pending' && (
          <DropdownMenuItem onClick={() => onPatch(row._id, 'approved')}>Approve</DropdownMenuItem>
        )}
        {(user?.role === 'admin' || user?.role === 'doctor') && row.status !== 'cancelled' && (
          <>
            <DropdownMenuItem onClick={() => onPatch(row._id, 'completed')}>Mark completed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPatch(row._id, 'cancelled')}>Set cancelled</DropdownMenuItem>
          </>
        )}
        {user?.role === 'patient' && (row.status === 'pending' || row.status === 'approved') && (
          <DropdownMenuItem onClick={() => onCancel(row._id)}>Cancel appointment</DropdownMenuItem>
        )}
        {user?.role === 'admin' && row.status !== 'cancelled' && (
          <DropdownMenuItem onClick={() => onCancel(row._id)}>Cancel (admin)</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
