/** Thousands-comma'd integer, for axis ticks and tooltip values — never a raw unrounded float. */
export function formatChartValue(value: number): string {
  return Math.round(value).toLocaleString('en-GB')
}
