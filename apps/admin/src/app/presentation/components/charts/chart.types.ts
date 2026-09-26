/**
 * One named series of numeric values, aligned by index to a chart's `categories`. `colorVar` is
 * a CSS custom property name (e.g. `--color-chart-1`) — the caller passes a design token, never
 * a literal colour, so the chart stays theme-aware without knowing the token roles itself.
 */
export type ChartSeriesValues = {
  id: string
  label: string
  colorVar: string
  values: number[]
}

/**
 * A single summary number shown in a chart card's header, beside its title — the total (or
 * latest value; each caller states which) for the metric the chart already plots. `null` when
 * the chart has no range loaded yet, so a headline never reads "0" for missing data.
 */
export type ChartHeadline = {
  value: string
  label: string
}
