import {
  CHART_MAX_X_LABELS,
  CHART_MAX_X_LABELS_CEILING,
  CHART_MIN_LABEL_SPACING,
  CHART_Y_TICK_COUNT,
  chartPlotWidth,
} from './chart-layout'
import type { ChartSeriesValues } from './chart.types'

/**
 * Rounds `value` up to a "nice" ceiling (1/2/5 × a power of ten), so an axis never ends on an
 * ugly number like 137. Zero and negative inputs floor to 1 — a chart with no data never asks
 * for a zero-height scale. Also doubles as the step-rounding primitive `axisTicks` uses: rounding
 * a raw step size up to 1/2/5 × a power of ten is the same "nice number" computation.
 */
export function niceCeiling(value: number): number {
  if (value <= 0) return 1

  const exponent = Math.floor(Math.log10(value))
  const magnitude = 10 ** exponent
  const fraction = value / magnitude
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10

  return niceFraction * magnitude
}

/** The largest single value across every series — the scale a grouped/line chart needs. */
export function seriesMax(series: ChartSeriesValues[]): number {
  let max = 0
  for (const one of series) {
    for (const value of one.values) {
      if (value > max) max = value
    }
  }
  return max
}

/** The largest per-category sum across every series — the scale a stacked chart needs. */
export function stackedMax(series: ChartSeriesValues[]): number {
  const length = series[0]?.values.length ?? 0
  let max = 0
  for (let index = 0; index < length; index++) {
    let sum = 0
    for (const one of series) sum += one.values[index] ?? 0
    if (sum > max) max = sum
  }
  return max
}

/**
 * Evenly-spaced, nicely-rounded y-axis tick values from `0` to a ceiling at or above `rawMax`,
 * e.g. `axisTicks(75)` → `[0, 20, 40, 60, 80]`. The gridlines a chart draws are these exact
 * values, so the axis and the gridlines can never drift apart.
 */
export function axisTicks(rawMax: number, targetCount = CHART_Y_TICK_COUNT): number[] {
  if (rawMax <= 0) return [0, 1]

  const step = niceCeiling(rawMax / targetCount)
  const topTick = Math.ceil(rawMax / step) * step
  const ticks: number[] = []
  for (let value = 0; value <= topTick + step / 2; value += step) {
    ticks.push(Math.round(value))
  }
  return ticks
}

/** The nice-rounded y-axis ceiling for a chart, given whether its bars stack — the top tick. */
export function chartMax(series: ChartSeriesValues[], stacked: boolean): number {
  const ticks = axisTicks(stacked ? stackedMax(series) : seriesMax(series))
  return ticks[ticks.length - 1] ?? 1
}

/** Whether any series carries a positive value — the empty-state trigger for every chart. */
export function hasData(series: ChartSeriesValues[]): boolean {
  return series.some((one) => one.values.some((value) => value > 0))
}

/** Maps a value onto the chart's vertical axis, within `[offsetTop, offsetTop + plotHeight]`. */
export function yPosition(value: number, max: number, plotHeight: number, offsetTop = 0): number {
  if (max <= 0) return offsetTop + plotHeight
  return offsetTop + plotHeight - (value / max) * plotHeight
}

/** Maps a category index onto the chart's horizontal axis, evenly spaced from `offsetLeft`. */
export function xPosition(index: number, count: number, plotWidth: number, offsetLeft = 0): number {
  if (count <= 1) return offsetLeft + plotWidth / 2
  return offsetLeft + (index / (count - 1)) * plotWidth
}

/**
 * Which category indexes get an x-axis label. Below `maxLabels` every category is labelled;
 * above it, labels are thinned to an even stride while always keeping the first and last so the
 * range's start and end are never silently dropped.
 */
export function thinnedLabelIndexes(count: number, maxLabels = CHART_MAX_X_LABELS): number[] {
  if (count <= 0) return []
  if (count <= maxLabels) return Array.from({ length: count }, (_, index) => index)

  const stride = Math.ceil((count - 1) / (maxLabels - 1))
  const indexes = new Set<number>()
  for (let index = 0; index < count; index += stride) indexes.add(index)
  indexes.add(count - 1)

  return Array.from(indexes).sort((a, b) => a - b)
}

/**
 * How many x-axis labels fit a chart's *measured* plot width without overlapping, given each
 * needs roughly `CHART_MIN_LABEL_SPACING` px. A wide card earns more labels than a narrow one;
 * this is `thinnedLabelIndexes`'s `maxLabels` input, so thinning always reflects the real column
 * width rather than the fixed assumption `CHART_MAX_X_LABELS` was before per-chart width existed.
 */
export function maxLabelsForWidth(width: number): number {
  const plotWidth = chartPlotWidth(width)
  const fitting = Math.floor(plotWidth / CHART_MIN_LABEL_SPACING) + 1
  return Math.min(CHART_MAX_X_LABELS_CEILING, Math.max(2, fitting))
}
