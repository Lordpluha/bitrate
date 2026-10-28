import type { Locale } from '@/shared/i18n'

const UNITS = [
  { ms: 86_400_000, unit: 'day' },
  { ms: 3_600_000, unit: 'hour' },
  { ms: 60_000, unit: 'minute' },
] as const satisfies readonly {
  ms: number
  unit: Intl.RelativeTimeFormatUnit
}[]

type FormatRelativeTimeInput = {
  date: Date
  locale: Locale
  now?: Date
}

/**
 * "now", "5 min. ago", "3 hr. ago", "2 days ago" in the app locale: the largest whole unit
 * that fits.
 */
export const formatRelativeTime = ({
  date,
  locale,
  now = new Date(),
}: FormatRelativeTimeInput) => {
  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto',
    style: 'short',
  })
  const elapsed = now.getTime() - date.getTime()
  const match = UNITS.find(({ ms }) => elapsed >= ms)
  if (!match) return formatter.format(0, 'second')
  return formatter.format(-Math.floor(elapsed / match.ms), match.unit)
}
