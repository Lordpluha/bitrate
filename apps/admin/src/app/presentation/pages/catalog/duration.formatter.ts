/** Humanises a processing-attempt duration for an operator, e.g. "9m 58s" or "820ms". */
export function humaniseDurationMs(durationMs: number): string {
  if (durationMs < 1000) return `${durationMs}ms`

  const totalSeconds = Math.round(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds}s`
}
