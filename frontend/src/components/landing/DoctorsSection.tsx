import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FEATURED_DOCTORS } from './landing-data'
import { SectionHeading } from './SectionHeading'
import { StaggerGrid, StaggerItem } from './FadeIn'

export function DoctorsSection() {
  return (
    <section id="doctors" className="scroll-mt-24 bg-slate-50/80 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Care team"
          title="Meet our featured specialists"
          description="Experienced clinicians with transparent availability—ready when your patients need them."
        />

        <StaggerGrid className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_DOCTORS.map((doctor) => (
            <StaggerItem key={doctor.name}>
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                className="flex h-full flex-col rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div
                  className={cn(
                    'flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-semibold text-white shadow-md',
                    doctor.gradient
                  )}
                >
                  {doctor.initials}
                </div>

                <h3 className="mt-4 text-base font-semibold text-foreground">{doctor.name}</h3>
                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>

                <div className="mt-3 flex items-center gap-1.5 text-sm">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">{doctor.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">rating</span>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700">
                  <Clock className="size-3.5" />
                  {doctor.availability}
                </p>
              </motion.article>
            </StaggerItem>
          ))}
        </StaggerGrid>

        <div className="mt-10 text-center">
          <Button variant="outline" asChild className="rounded-full border-border/80 bg-white px-6">
            <Link to="/register">View all doctors in app</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
