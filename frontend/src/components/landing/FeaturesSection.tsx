import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { FEATURES } from './landing-data'
import { SectionHeading } from './SectionHeading'
import { StaggerGrid, StaggerItem } from './FadeIn'

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24 bg-slate-50/80 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Platform"
          title="Everything your clinic needs"
          description="Purpose-built tools for scheduling, records, and care teams—without the clutter."
        />

        <StaggerGrid className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title}>
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                className={cn(
                  'group h-full rounded-2xl border border-border/60 bg-white p-6 shadow-sm',
                  'transition-shadow hover:border-indigo-200/80 hover:shadow-lg hover:shadow-indigo-500/5'
                )}
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 text-indigo-600 transition-transform group-hover:scale-105">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.article>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}
