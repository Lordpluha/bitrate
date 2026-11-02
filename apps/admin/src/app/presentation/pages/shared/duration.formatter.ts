const SECONDS_PER_MINUTE = 60

/** What an unknown duration shows as. */
const NO_DURATION = '—'

/** Humanises a processing-attempt duration for an operator, e.g. "9m 58s" or "820ms". */
export function humaniseDurationMs(durationMs: number): string {
  if (durationMs < 1000) return `${durationMs}ms`

  const totalSeconds = Math.round(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE)
  const seconds = totalSeconds % SECONDS_PER_MINUTE

  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds}s`
}

/** A recording's length as a clock, e.g. "3:07"; "—" when unknown. */
export function formatClockDuration(seconds: number | null): string {
  if (seconds === null) return NO_DURATION
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE)
  return `${minutes}:${String(seconds % SECONDS_PER_MINUTE).padStart(2, '0')}`
}
