/** Stable portal target for Radix overlays (client-only). */
export function getPortalContainer(): HTMLElement | undefined {
  return typeof document !== 'undefined' ? document.body : undefined
}
