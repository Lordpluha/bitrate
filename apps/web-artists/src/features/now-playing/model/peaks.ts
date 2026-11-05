/** Shortens `peaks` to `count` bars by taking each bucket's loudest value. */
export function downsamplePeaks(peaks: readonly number[], count: number) {
  if (peaks.length === 0) return Array.from({ length: count }, () => 0.08)
  return Array.from({ length: count }, (_, index) => {
    const start = Math.floor((index * peaks.length) / count)
    const end = Math.max(
      start + 1,
      Math.floor(((index + 1) * peaks.length) / count),
    )
    let loudest = 0
    for (let at = start; at < end && at < peaks.length; at++)
      loudest = Math.max(loudest, peaks[at] ?? 0)
    // Silence still draws a sliver, so the bar count reads as a timeline.
    return Math.max(0.06, Math.min(1, loudest))
  })
}
