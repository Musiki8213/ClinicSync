import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { FadeIn } from './FadeIn'

export function CTASection() {
  const { user } = useAuth()

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-indigo-200/50 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 px-6 py-14 text-center shadow-2xl shadow-indigo-500/25 sm:px-12 sm:py-16"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
            <div className="pointer-events-none absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Transform Your Clinic Management Today
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-indigo-100 sm:text-base">
                Join hundreds of clinics streamlining appointments, records, and team coordination on ClinicSync.
              </p>

              <div className="mt-8 flex justify-center">
                <Button
                  size="lg"
                  asChild
                  className="h-11 rounded-full bg-white px-6 text-indigo-700 shadow-lg hover:bg-white/95"
                >
                  <Link to={user ? '/app/dashboard' : '/register'}>
                    Get Started
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  )
}
