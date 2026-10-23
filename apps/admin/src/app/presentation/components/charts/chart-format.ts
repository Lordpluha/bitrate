/** Thousands-comma'd integer, for axis ticks and tooltip values — never a raw unrounded float. */
export function formatChartValue(value: number): string {
  return Math.round(value).toLocaleString('en-GB')
}

const TICK_FORMAT = new Intl.NumberFormat('en-GB', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

/** A short axis label — "240K" rather than "240,000", so ticks fit the plot's fixed gutter. */
export function formatChartTick(value: number): string {
  return TICK_FORMAT.format(Math.round(value))
}
