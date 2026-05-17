import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/api/client'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { isAxiosError } from 'axios'

interface MePatient {
  name: string
  age?: number
  gender?: string
  medicalHistory?: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [patient, setPatient] = useState<MePatient | null>(null)
  const [loading, setLoading] = useState(user?.role === 'patient')

  useEffect(() => {
    if (user?.role !== 'patient') return
    void (async () => {
      try {
        const { data } = await api.get<{ patient: MePatient }>('/patients/me/profile')
        setPatient(data.patient)
      } catch {
        toast({ title: 'Could not load profile', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.role])

  async function savePatient(e: React.FormEvent) {
    e.preventDefault()
    if (!patient) return
    try {
      const { data } = await api.patch<{ patient: MePatient }>('/patients/me', patient)
      setPatient(data.patient)
      toast({ title: 'Profile updated', variant: 'success' })
    } catch (err) {
      const msg = isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined
      toast({ title: 'Update failed', description: msg, variant: 'destructive' })
    }
  }

  if (user?.role === 'patient') {
    if (loading || !patient) {
      return (
        <div className="flex h-48 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )
    }
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Profile</h1>
          <p className="text-muted-foreground">Keep your chart details current</p>
        </div>
        <form onSubmit={savePatient}>
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle>Patient information</CardTitle>
              <CardDescription>Account email: {user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pname">Name</Label>
                <Input
                  id="pname"
                  value={patient.name}
                  onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page">Age</Label>
                <Input
                  id="page"
                  type="number"
                  value={patient.age ?? ''}
                  onChange={(e) => setPatient({ ...patient, age: e.target.value ? Number(e.target.value) : undefined })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={patient.gender || 'prefer_not_say'}
                  onValueChange={(g) => setPatient({ ...patient, gender: g })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prefer_not_say">Prefer not to say</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phist">Medical history</Label>
                <Input
                  id="phist"
                  value={patient.medicalHistory || ''}
                  onChange={(e) => setPatient({ ...patient, medicalHistory: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <Button type="submit" className="rounded-xl">
                Save changes
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Profile</h1>
        <p className="text-muted-foreground">Your ClinicSync account</p>
      </div>
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>{user?.name}</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Role:</span> <span className="capitalize">{user?.role}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
