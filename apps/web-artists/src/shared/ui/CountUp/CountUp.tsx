import { useI18n } from '@shared/i18n'
import { motionReduced } from '@shared/lib/motion'
import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 1400

interface CountUpProps {
  value: number
  className?: string
}

/**
 * A number that rolls up from zero the first time it scrolls into view. The final value is
 * rendered from the start for screen readers, search and reduced motion.
 */
export function CountUp({ value, className }: CountUpProps) {
  const { locale } = useI18n()
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(value)
  useEffect(() => {
    const node = ref.current
    if (!node || motionReduced() || value === 0) {
      setShown(value)
      return
    }
    let frame = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / DURATION_MS)
        setShown(Math.round(value * (1 - (1 - progress) ** 4)))
        if (progress < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    })
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])
  const format = new Intl.NumberFormat(locale)
  return (
    <span className={className} ref={ref}>
      <span aria-hidden="true">{format.format(shown)}</span>
      <span className="sr-only">{format.format(value)}</span>
    </span>
  )
}
