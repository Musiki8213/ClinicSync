import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from './landing-data'
import { useLandingSectionSpy } from './useLandingSectionSpy'

function navLinkClassName(active: boolean, mobile = false) {
  return cn(
    mobile
      ? 'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors'
      : 'relative text-sm font-medium transition-colors',
    active
      ? mobile
        ? 'bg-indigo-50 text-foreground underline decoration-2 underline-offset-4 decoration-indigo-600'
        : 'text-foreground underline decoration-2 underline-offset-[7px] decoration-indigo-600'
      : mobile
        ? 'text-foreground hover:bg-muted'
        : 'text-muted-foreground hover:text-foreground'
  )
}

export function LandingNavbar() {
  const { user } = useAuth()
  const activeSectionId = useLandingSectionSpy()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border/60 bg-white/90 shadow-sm backdrop-blur-xl'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25"
          >
            <Activity className="size-4" />
          </motion.div>
          <span className="text-lg font-semibold tracking-tight text-foreground">ClinicSync</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const isActive = activeSectionId === link.href.slice(1)
            return (
              <a
                key={link.href}
                href={link.href}
                className={navLinkClassName(isActive)}
                aria-current={isActive ? 'location' : undefined}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        <motion.div className="hidden items-center gap-2 sm:flex">
          {user ? (
            <Button asChild className="rounded-full px-5 shadow-sm">
              <Link to="/app/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="rounded-full">
                <Link to="/login/patient">Login</Link>
              </Button>
              <Button asChild className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500">
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </motion.div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-xl border border-border/80 bg-white/80 text-foreground md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-border/60 bg-white md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
              {NAV_LINKS.map((link) => {
                const isActive = activeSectionId === link.href.slice(1)
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={navLinkClassName(isActive, true)}
                    aria-current={isActive ? 'location' : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              })}
              <motion.div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
                {user ? (
                  <Button asChild className="w-full rounded-full">
                    <Link to="/app/dashboard" onClick={() => setMobileOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full rounded-full">
                      <Link to="/login/patient" onClick={() => setMobileOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button asChild className="w-full rounded-full">
                      <Link to="/register" onClick={() => setMobileOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </>
                )}
              </motion.div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
