import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, CheckCircle2, Sparkles, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { MAX_DOCTORS } from '@/data/demoAccounts'
import { FadeIn } from './FadeIn'

function FloatingCard({
  className,
  delay,
  children,
}: {
  className?: string
  delay: number
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-sky-500/20 blur-2xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/80 p-4 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl sm:p-5"
      >
        <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Clinic overview</p>
            <p className="text-sm font-semibold text-foreground">Today&apos;s operations</p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
            Live
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: 'Appointments', value: '24', icon: Calendar },
            { label: 'Patients', value: '186', icon: Users },
            { label: 'Utilization', value: '92%', icon: TrendingUp },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/50 bg-muted/40 p-2.5 sm:p-3"
            >
              <stat.icon className="mb-1.5 size-4 text-primary" />
              <p className="text-lg font-semibold text-foreground sm:text-xl">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground sm:text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          {[
            { time: '09:30', patient: 'Jordan Lee', status: 'Confirmed' },
            { time: '11:00', patient: 'Alex Morgan', status: 'Pending' },
            { time: '14:15', patient: 'Sam Rivera', status: 'Confirmed' },
          ].map((row) => (
            <div
              key={row.time}
              className="flex items-center justify-between rounded-lg border border-border/40 bg-white px-3 py-2 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground">{row.time}</span>
                <span className="font-medium text-foreground">{row.patient}</span>
              </div>
              <span
                className={
                  row.status === 'Confirmed'
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <FloatingCard
        delay={0.35}
        className="absolute -left-2 top-8 z-10 hidden w-[11.5rem] sm:block sm:-left-6 sm:w-52"
      >
        <div className="rounded-xl border border-border/60 bg-white/95 p-3 shadow-lg backdrop-blur-md">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Upcoming
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">Dr. Sarah Chen</p>
          <p className="text-xs text-muted-foreground">Cardiology · 10:30 AM</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600">
            <CheckCircle2 className="size-3.5" />
            Confirmed
          </div>
        </div>
      </FloatingCard>

      <FloatingCard
        delay={0.5}
        className="absolute -right-1 bottom-16 z-10 w-[10.5rem] sm:-right-4 sm:w-48"
      >
        <div className="rounded-xl border border-border/60 bg-white/95 p-3 shadow-lg backdrop-blur-md">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Availability
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{MAX_DOCTORS} doctors open</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
          </div>
        </div>
      </FloatingCard>

      <FloatingCard delay={0.65} className="absolute -bottom-2 right-8 z-10 hidden sm:block">
        <div className="rounded-xl border border-border/60 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md">
          <p className="text-xs text-muted-foreground">Patient satisfaction</p>
          <p className="text-lg font-semibold text-foreground">98.4%</p>
        </div>
      </FloatingCard>
    </div>
  )
}

export function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative overflow-x-hidden pt-24 pb-12 sm:pt-32 sm:pb-24 lg:pb-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <FadeIn className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            Trusted by 500+ clinics worldwide
          </div>

          <h1 className="mt-5 text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            Smarter Healthcare Starts Here.
          </h1>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Manage appointments, patient records, schedules, and clinic operations in one secure
            platform.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              asChild
              className="h-11 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-6 shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500"
            >
              <Link to={user ? '/app/book' : '/register'}>
                Book Appointment
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-11 rounded-full border-border/80 bg-white/80 px-6 backdrop-blur-sm">
              <a href="#features">Explore Platform</a>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {['HIPAA-ready workflows', 'Role-based access', 'Real-time scheduling'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn delay={0.15} className="lg:justify-self-end">
          <HeroMockup />
        </FadeIn>
      </div>
    </section>
  )
}
