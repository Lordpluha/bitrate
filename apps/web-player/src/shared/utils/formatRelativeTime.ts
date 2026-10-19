const UNITS = [
  { ms: 86_400_000, unit: 'day' },
  { ms: 3_600_000, unit: 'hour' },
  { ms: 60_000, unit: 'minute' },
] as const satisfies readonly {
  ms: number
  unit: Intl.RelativeTimeFormatUnit
}[]

const formatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
  style: 'short',
})

type FormatRelativeTimeInput = {
  date: Date
  now?: Date
}

/** "now", "5 min. ago", "3 hr. ago", "2 days ago": the largest whole unit that fits. */
export const formatRelativeTime = ({
  date,
  now = new Date(),
}: FormatRelativeTimeInput) => {
  const elapsed = now.getTime() - date.getTime()
  const match = UNITS.find(({ ms }) => elapsed >= ms)
  if (!match) return 'now'
  return formatter.format(-Math.floor(elapsed / match.ms), match.unit)
}
