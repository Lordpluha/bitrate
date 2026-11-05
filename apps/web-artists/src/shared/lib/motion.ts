/** True when the OS asks for less motion or the workspace Motion setting is Reduced. */
export function motionReduced() {
  if (typeof window === 'undefined') return true
  return (
    document.documentElement.dataset.motion === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
