'use client'

import { useEffect, useState } from 'react'

/**
 * Tracks the window's inner width via the resize event — not a media query.
 * For structural responsive layout (which JSX to show), use Tailwind's
 * breakpoint prefixes instead; this hook exists only for consumers that need
 * an actual pixel value to drive non-CSS layout math (e.g. drag-resizable
 * grid columns).
 */
export function useWindowWidth(): number {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? 0 : window.innerWidth,
  )

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return width
}
