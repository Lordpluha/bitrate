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
