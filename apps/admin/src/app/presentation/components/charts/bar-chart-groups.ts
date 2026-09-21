import { CHART_PADDING_LEFT, CHART_PADDING_TOP, CHART_PLOT_HEIGHT } from './chart-layout'
import type { ChartSeriesValues } from './chart.types'

/** Fraction of each category's width left as a gap around its bar(s). */
const GROUP_GAP = 0.15

/** One rendered bar. */
export type BarRect = {
  x: number
  y: number
  width: number
  height: number
  colorVar: string
}

/** One category's rendered bars — one per series, stacked or side by side. */
export type BarGroup = {
  category: string
  rects: BarRect[]
  centerX: number
}

/**
 * Lays out every category's bar(s) inside the chart's plot area, stacked or grouped side by
 * side. Pure geometry — `BarChart` owns rendering and interaction, this owns only the math.
 * `plotWidth` is the chart's *measured* drawable width (`chartPlotWidth` of its real rendered
 * width), not a fixed constant — see `chart-width.ts`.
 */
export function computeBarGroups(
  categories: string[],
  series: ChartSeriesValues[],
  stacked: boolean,
  max: number,
  plotWidth: number,
): BarGroup[] {
  const count = categories.length
  if (count === 0) return []

  const groupWidth = plotWidth / count
  const gap = groupWidth * GROUP_GAP
  const barWidth = stacked
    ? groupWidth - gap * 2
    : (groupWidth - gap * 2) / Math.max(series.length, 1)

  return categories.map((category, index) => {
    const groupX = CHART_PADDING_LEFT + index * groupWidth + gap
    let stackTop = CHART_PADDING_TOP + CHART_PLOT_HEIGHT

    const rects = series.map((one, seriesIndex) => {
      const value = one.values[index] ?? 0
      const barHeight = max > 0 ? (value / max) * CHART_PLOT_HEIGHT : 0
      const x = stacked ? groupX : groupX + seriesIndex * barWidth
      let y: number
      if (stacked) {
        stackTop -= barHeight
        y = stackTop
      } else {
        y = CHART_PADDING_TOP + CHART_PLOT_HEIGHT - barHeight
      }
      return { x, y, width: barWidth, height: barHeight, colorVar: one.colorVar }
    })

    return { category, rects, centerX: groupX + (groupWidth - gap * 2) / 2 }
  })
}
