import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { TESTIMONIALS } from './landing-data'
import { SectionHeading } from './SectionHeading'
import { StaggerGrid, StaggerItem } from './FadeIn'

export function TestimonialsSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved by clinics, doctors, and patients"
          description="Real feedback from teams who run their day on ClinicSync."
        />

        <StaggerGrid className="mt-14 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <StaggerItem key={item.name}>
              <motion.blockquote
                whileHover={{ y: -4 }}
                className="flex h-full flex-col rounded-2xl border border-border/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <Quote className="size-8 text-indigo-200" aria-hidden />
                <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground">&ldquo;{item.quote}&rdquo;</p>
                <footer className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                  <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.role} · {item.org}
                    </p>
                  </div>
                </footer>
              </motion.blockquote>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}
