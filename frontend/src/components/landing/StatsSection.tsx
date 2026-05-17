import { motion } from 'framer-motion'
import { STATS } from './landing-data'
import { StaggerGrid, StaggerItem } from './FadeIn'

export function StatsSection() {
  return (
    <section className="border-y border-border/60 bg-white py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <StaggerGrid className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {STATS.map((stat) => (
            <StaggerItem key={stat.label}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="group rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                  <stat.icon className="size-5" />
                </div>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label === 'Appointments' ? 'Appointments Managed' : stat.label}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}
