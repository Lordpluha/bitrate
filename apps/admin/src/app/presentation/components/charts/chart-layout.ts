/**
 * Shared SVG geometry for every hand-written chart. `CHART_HEIGHT` is fixed and identical for
 * every chart — it is never derived from the rendered width — so every card in a row ends up the
 * same height instead of following its own column's aspect ratio. `CHART_WIDTH` is only the
 * fallback used for the very first render, before `trackChartWidth` (`chart-width.ts`) reports a
 * real measurement from `ResizeObserver`; once it does, the chart's `viewBox` width is set to that
 * exact pixel value, so one SVG unit equals one CSS pixel and nothing inside — axis labels
 * included — is ever scaled to fit. `CHART_PADDING_*` reserves room on the left (y-axis tick
 * labels) and the bottom (x-axis tick labels) so text never clips against the edge;
 * `CHART_PLOT_HEIGHT` is the drawable height inside that padding — the plot width is computed at
 * runtime from the measured width, see `chartPlotWidth`.
 */
export const CHART_WIDTH = 480

export const CHART_HEIGHT = 200

export const CHART_PADDING_LEFT = 40

export const CHART_PADDING_RIGHT = 8

export const CHART_PADDING_TOP = 8

export const CHART_PADDING_BOTTOM = 24

export const CHART_PLOT_HEIGHT = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM

/** The drawable width inside the left/right padding, for a chart whose measured width is `width`. */
export function chartPlotWidth(width: number): number {
  return Math.max(0, width - CHART_PADDING_LEFT - CHART_PADDING_RIGHT)
}

/** How many categories get an x-axis label before thinning kicks in, on the fallback width. */
export const CHART_MAX_X_LABELS = 6

/** Target number of y-axis ticks (including 0) a chart aims to render. */
export const CHART_Y_TICK_COUNT = 4

/** Minimum horizontal room (px) an x-axis label needs so thinned labels never overlap. */
export const CHART_MIN_LABEL_SPACING = 56

/** Hard ceiling on x-axis labels regardless of how wide the chart is. */
export const CHART_MAX_X_LABELS_CEILING = 10
