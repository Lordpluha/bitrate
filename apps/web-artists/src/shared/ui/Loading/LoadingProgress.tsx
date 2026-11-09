import { useEffect, useState } from 'react'

/** Delay short requests; no synthetic percentage when navigation has no measurable total. */
export function LoadingProgress({
  active,
  label,
  initiallyVisible = false,
}: {
  active: boolean
  label: string
  initiallyVisible?: boolean
}) {
  const [visible, setVisible] = useState(initiallyVisible)
  useEffect(() => {
    if (!active) {
      setVisible(false)
      return
    }
    const timer = window.setTimeout(() => setVisible(true), 150)
    return () => window.clearTimeout(timer)
  }, [active])

  if (!active || !visible) return null
  return (
    <div
      aria-label={label}
      className="artist-route-progress"
      role="progressbar"
    >
      <div aria-hidden="true" className="artist-route-progress-indicator" />
    </div>
  )
}
