import { useI18n } from '@shared/i18n'
import { useEffect, useRef, useState } from 'react'
import { isMotionReduced } from '../lib/landingInteractions'

export function ResponseNumber({
  value,
  entered,
  decimals = 0,
}: {
  value: number
  entered: boolean
  decimals?: number
}) {
  const { locale } = useI18n()
  const current = useRef(0)
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!entered) return
    if (isMotionReduced()) {
      current.current = value
      setShown(value)
      return
    }
    const from = current.current
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 1100)
      current.current = from + (value - from) * (1 - (1 - progress) ** 3)
      setShown(current.current)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [entered, value])
  const format = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return (
    <>
      <span aria-hidden="true">{format.format(shown)}</span>
      <span className="sr-only">{format.format(value)}</span>
    </>
  )
}
