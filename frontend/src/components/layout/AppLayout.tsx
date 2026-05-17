import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Activity,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Stethoscope,
  Sun,
  UserCircle,
  UserCog,
  Users,
} from 'lucide-react'
import { useAuth, type Role } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const linkClass =
  'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'

const activeClass = 'bg-primary/10 text-primary'

function navForRole(role: Role) {
  const base = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/appointments', label: 'Appointments', icon: CalendarDays },
    { to: '/app/doctors', label: 'Doctors', icon: Stethoscope },
  ]
  if (role === 'patient') {
    return [...base.slice(0, 2), { to: '/app/book', label: 'Book', icon: ClipboardList }, ...base.slice(2)]
  }
  if (role === 'admin') {
    return [
      ...base.slice(0, 2),
      { to: '/app/admin/doctors', label: 'Doctor registry', icon: UserCog },
      { to: '/app/patients', label: 'Patients', icon: Users },
      ...base.slice(2),
    ]
  }
  if (role === 'doctor') {
    return [...base.slice(0, 2), { to: '/app/patients', label: 'Patients', icon: Users }, ...base.slice(2)]
  }
  return base
}

type NavItem = ReturnType<typeof navForRole>[number]

function SidebarBrand({ role }: { role?: Role }) {
  return (
    <div className="flex items-center gap-2 px-4 py-5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Activity className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">ClinicSync</p>
        <p className="truncate text-xs capitalize text-muted-foreground">{role}</p>
      </div>
    </div>
  )
}

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) => cn(linkClass, isActive && activeClass)}
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </NavLink>
      ))}
      <NavLink
        to="/app/profile"
        onClick={onNavigate}
        className={({ isActive }) => cn(linkClass, isActive && activeClass)}
      >
        <UserCircle className="size-4 shrink-0" />
        Profile
      </NavLink>
    </nav>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const items = user ? navForRole(user.role) : []

  const closeMobileNav = () => setMobileNavOpen(false)

  return (
    <div className="flex min-h-screen min-w-0 bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-card shadow-sm lg:flex">
        <SidebarBrand role={user?.role} />
        <Separator />
        <NavLinks items={items} />
        <div className="border-t p-3">
          <Button variant="outline" className="min-h-11 w-full justify-start gap-2 rounded-xl" onClick={() => logout()}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="flex w-[min(100vw-2rem,18rem)] flex-col gap-0 p-0 sm:max-w-xs">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SidebarBrand role={user?.role} />
          <Separator />
          <NavLinks items={items} onNavigate={closeMobileNav} />
          <div className="border-t p-3">
            <Button
              variant="outline"
              className="min-h-11 w-full justify-start gap-2 rounded-xl"
              onClick={() => {
                closeMobileNav()
                void logout()
              }}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-card/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 rounded-xl lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground sm:text-xs">Signed in</p>
              <p className="truncate text-sm font-medium sm:text-base">{user?.name}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => toggle()} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl sm:h-10 sm:px-4"
              onClick={() => navigate('/app/appointments')}
            >
              <CalendarDays className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">Schedule</span>
            </Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
