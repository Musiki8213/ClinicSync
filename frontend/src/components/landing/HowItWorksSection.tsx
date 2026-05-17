import { motion } from 'framer-motion'
import { SectionHeading } from './SectionHeading'
import { STEPS } from './landing-data'
import { FadeIn } from './FadeIn'

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Go live in three simple steps"
          description="From signup to scheduled visits—ClinicSync keeps every role aligned."
        />

        <div className="relative mt-14">
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
            {STEPS.map((step, index) => (
              <FadeIn key={step.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative flex h-full flex-col rounded-2xl border border-border/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  {index < STEPS.length - 1 ? (
                    <span className="absolute -right-3 top-14 hidden size-6 items-center justify-center rounded-full border border-border bg-white text-muted-foreground lg:flex">
                      →
                    </span>
                  ) : null}

                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Step {step.step}
                  </span>
                  <div className="mt-4 flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <step.icon className="size-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
