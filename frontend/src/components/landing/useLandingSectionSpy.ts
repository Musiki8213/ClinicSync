import { useEffect, useState } from 'react'
import { NAV_LINKS } from './landing-data'

const SECTION_IDS = NAV_LINKS.map((link) => link.href.slice(1))

export function useLandingSectionSpy() {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const syncFromHash = () => {
      const id = window.location.hash.replace('#', '')
      if (SECTION_IDS.includes(id)) setActiveId(id)
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)

    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    )

    const observer =
      elements.length > 0
        ? new IntersectionObserver(
            (entries) => {
              const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

              if (visible[0]) {
                setActiveId(visible[0].target.id)
              }
            },
            {
              rootMargin: '-80px 0px -50% 0px',
              threshold: [0, 0.15, 0.35, 0.55],
            }
          )
        : null

    elements.forEach((el) => observer?.observe(el))

    const onScroll = () => {
      if (window.scrollY < 100) {
        setActiveId(null)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      observer?.disconnect()
      window.removeEventListener('hashchange', syncFromHash)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return activeId
}
