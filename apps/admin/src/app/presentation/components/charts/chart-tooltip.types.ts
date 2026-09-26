/** One series' reading at the hovered/focused category, for the tooltip readout. */
export type ChartTooltipRow = {
  id: string
  label: string
  colorVar: string
  value: number
}

/**
 * Everything the tooltip needs for one hovered/focused category: which category, every series'
 * value there, the stacked total (`null` when the chart doesn't stack), and where along the
 * chart's width to position the overlay.
 */
export type ChartTooltipState = {
  category: string
  rows: ChartTooltipRow[]
  total: number | null
  xPercent: number
}
