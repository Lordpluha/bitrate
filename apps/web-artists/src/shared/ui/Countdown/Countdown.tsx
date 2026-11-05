import { cn } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { useEffect, useState } from 'react'
import { countdownParts } from './countdown'

interface CountdownProps {
  /** ISO instant to count down to. */
  to: string
  className?: string
}

const pad = (value: number) => String(value).padStart(2, '0')

/** Days, hours, minutes and seconds until `to`, ticking every second. */
export function Countdown({ to, className }: CountdownProps) {
  const { t, tp } = useI18n()
  const target = Date.parse(to)
  // The server render shows the date it was given; the clock starts after hydration.
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const parts = countdownParts(target, now ?? target)
  const units = [
    {
      key: 'days',
      value: parts.days,
      label: tp({ count: parts.days, key: 'countdown.days' }),
    },
    {
      key: 'hours',
      value: parts.hours,
      label: tp({ count: parts.hours, key: 'countdown.hours' }),
    },
    {
      key: 'minutes',
      value: parts.minutes,
      label: tp({ count: parts.minutes, key: 'countdown.minutes' }),
    },
    {
      key: 'seconds',
      value: parts.seconds,
      label: tp({ count: parts.seconds, key: 'countdown.seconds' }),
    },
  ] as const
  return (
    <div
      aria-label={t('countdown.label', {
        days: parts.days,
        hours: parts.hours,
        minutes: parts.minutes,
      })}
      className={cn('artist-countdown', className)}
      role="timer"
    >
      {units.map((unit) => {
        const digits = pad(unit.value)
        const leading = digits.slice(0, -1)
        const last = digits.slice(-1)
        return (
          <span
            aria-hidden="true"
            className="artist-countdown-unit"
            key={unit.key}
          >
            {/* A digit's key is its value, so only the digit that changed remounts and rolls in. */}
            <b>
              <span className="artist-countdown-digit" key={`lead-${leading}`}>
                {leading}
              </span>
              <span className="artist-countdown-digit" key={`last-${last}`}>
                {last}
              </span>
            </b>
            <span>{unit.label}</span>
          </span>
        )
      })}
    </div>
  )
}
