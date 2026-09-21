import {
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  input,
  viewChild,
} from '@angular/core'
import {
  CHART_HEIGHT,
  CHART_PADDING_BOTTOM,
  CHART_PADDING_LEFT,
  CHART_PADDING_RIGHT,
  CHART_PADDING_TOP,
  CHART_PLOT_HEIGHT,
  chartPlotWidth,
} from './chart-layout'
import { formatChartValue } from './chart-format'
import { ChartHoverState } from './chart-hover-state'
import {
  axisTicks,
  hasData,
  maxLabelsForWidth,
  seriesMax,
  thinnedLabelIndexes,
  xPosition,
  yPosition,
} from './chart-scale'
import { ChartTooltip } from './chart-tooltip'
import type { ChartTooltipRow, ChartTooltipState } from './chart-tooltip.types'
import { trackChartWidth } from './chart-width'
import type { ChartSeriesValues } from './chart.types'

/**
 * A multi-series line chart, hand-written SVG rather than a charting library. Draws real x/y
 * axes and a hover/focus tooltip; every value also reaches a visually-hidden `<table>` alongside
 * the (`aria-hidden`) SVG, so a screen reader gets the real numbers instead of a silent picture —
 * see `.claude/rules/architecture-checklist.md` for why an unlabelled `<svg>` is a review FAIL.
 */
@Component({
  selector: 'app-line-chart',
  imports: [ChartTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './line-chart.html',
})
export class LineChart {
  readonly title = input.required<string>()
  readonly description = input.required<string>()
  readonly categories = input.required<string[]>()
  readonly series = input.required<ChartSeriesValues[]>()
  readonly emptyMessage = input('No data for this range.')

  protected readonly plotHost = viewChild<ElementRef<HTMLElement>>('plotHost')
  protected readonly width = trackChartWidth(this.plotHost)
  protected readonly plotWidth = computed(() => chartPlotWidth(this.width()))

  protected readonly height = CHART_HEIGHT
  protected readonly plotTop = CHART_PADDING_TOP
  protected readonly paddingLeftPercent = computed(() => (CHART_PADDING_LEFT / this.width()) * 100)
  protected readonly paddingRightPercent = computed(
    () => (CHART_PADDING_RIGHT / this.width()) * 100,
  )

  protected readonly hasPoints = computed(() => hasData(this.series()))
  protected readonly yTicks = computed(() => axisTicks(seriesMax(this.series())))
  private readonly max = computed(() => this.yTicks().at(-1) ?? 1)
  protected readonly xLabelIndexes = computed(() =>
    thinnedLabelIndexes(this.categories().length, maxLabelsForWidth(this.width())),
  )

  protected readonly hover = new ChartHoverState()
  protected readonly tooltip = computed<ChartTooltipState | null>(() => {
    const index = this.hover.activeIndex()
    if (index === null) return null

    const category = this.categories()[index]
    if (category === undefined) return null

    const rows: ChartTooltipRow[] = this.series().map((item) => ({
      id: item.id,
      label: item.label,
      colorVar: item.colorVar,
      value: item.values[index] ?? 0,
    }))

    return { category, rows, total: null, xPercent: (this.pointX(index) / this.width()) * 100 }
  })

  protected tickY(tick: number): number {
    return yPosition(tick, this.max(), CHART_PLOT_HEIGHT, CHART_PADDING_TOP)
  }

  protected tickLabel(tick: number): string {
    return formatChartValue(tick)
  }

  protected xLabel(index: number): string {
    return this.categories()[index] ?? ''
  }

  protected xLabelAnchor(index: number): 'start' | 'middle' | 'end' {
    if (index === 0) return 'start'
    if (index === this.categories().length - 1) return 'end'
    return 'middle'
  }

  protected pointX(index: number): number {
    return xPosition(index, this.categories().length, this.plotWidth(), CHART_PADDING_LEFT)
  }

  protected pointY(value: number): number {
    return yPosition(value, this.max(), CHART_PLOT_HEIGHT, CHART_PADDING_TOP)
  }

  protected linePoints(values: number[]): string {
    return values.map((value, index) => `${this.pointX(index)},${this.pointY(value)}`).join(' ')
  }

  protected axisBottomY(): number {
    return CHART_HEIGHT - CHART_PADDING_BOTTOM
  }

  protected tooltipLabel(index: number): string {
    const parts = this.series().map(
      (item) => `${item.label} ${formatChartValue(item.values[index] ?? 0)}`,
    )
    return `${this.xLabel(index)}: ${parts.join(', ')}`
  }
}
