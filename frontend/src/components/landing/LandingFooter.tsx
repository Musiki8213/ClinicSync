import { Link } from 'react-router-dom'
import { Activity, Globe, Mail, MessageCircle, Share2 } from 'lucide-react'
import { FOOTER_LINKS } from './landing-data'

const SOCIAL = [
  { label: 'Website', href: 'https://clinicsync.com', icon: Globe },
  { label: 'Contact', href: 'mailto:hello@clinicsync.com', icon: MessageCircle },
  { label: 'Share', href: 'https://clinicsync.com', icon: Share2 },
] as const

export function LandingFooter() {
  return (
    <footer id="contact" className="scroll-mt-24 border-t border-border/60 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                <Activity className="size-4" />
              </div>
              <span className="text-lg font-semibold tracking-tight">ClinicSync</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Modern healthcare operations for clinics that care about patient experience and team efficiency.
            </p>
            <a
              href="mailto:hello@clinicsync.com"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
            >
              <Mail className="size-4" />
              hello@clinicsync.com
            </a>
            <div className="mt-5 flex gap-3">
              {SOCIAL.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Product</p>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Company</p>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Portals</p>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.portals.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ClinicSync. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Built for modern healthcare teams.</p>
        </div>
      </div>
    </footer>
  )
}
