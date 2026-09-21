import {
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  input,
  viewChild,
} from '@angular/core'
import { computeBarGroups } from './bar-chart-groups'
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
import { axisTicks, chartMax, hasData, maxLabelsForWidth, thinnedLabelIndexes } from './chart-scale'
import { ChartTooltip } from './chart-tooltip'
import type { ChartTooltipRow, ChartTooltipState } from './chart-tooltip.types'
import { trackChartWidth } from './chart-width'
import type { ChartHeadline, ChartSeriesValues } from './chart.types'

/**
 * A grouped or stacked bar chart, hand-written SVG. Used both for a date-series (uploads by
 * outcome, reports per day) and a plain category breakdown (report status) — `categories` is
 * just a label per position, so either use reuses the same component. See `LineChart` for the
 * accessible-table and axis/tooltip pattern this mirrors; `computeBarGroups` owns the bar
 * geometry.
 */
@Component({
  selector: 'app-bar-chart',
  imports: [ChartTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bar-chart.html',
})
export class BarChart {
  readonly title = input.required<string>()
  readonly description = input.required<string>()
  readonly categories = input.required<string[]>()
  readonly series = input.required<ChartSeriesValues[]>()
  readonly stacked = input(false)
  readonly emptyMessage = input('No data for this range.')
  readonly headline = input<ChartHeadline | null>(null)
  /** When set, the plot area shows this state instead of the data — the header, description and
   *  any projected content (a status strip) stay visible regardless, so a chart that carries a
   *  current-state count never loses it just because its own series request is slow or failed. */
  readonly loading = input(false)
  readonly failure = input<string | null>(null)

  protected readonly plotHost = viewChild<ElementRef<HTMLElement>>('plotHost')
  protected readonly width = trackChartWidth(this.plotHost)
  protected readonly plotWidth = computed(() => chartPlotWidth(this.width()))

  protected readonly height = CHART_HEIGHT
  protected readonly plotTop = CHART_PADDING_TOP
  protected readonly plotHeight = CHART_PLOT_HEIGHT
  protected readonly paddingLeftPercent = computed(() => (CHART_PADDING_LEFT / this.width()) * 100)
  protected readonly paddingRightPercent = computed(
    () => (CHART_PADDING_RIGHT / this.width()) * 100,
  )

  protected readonly hasPoints = computed(() => hasData(this.series()))
  protected readonly yTicks = computed(() => axisTicks(chartMax(this.series(), this.stacked())))
  private readonly max = computed(() => this.yTicks().at(-1) ?? 1)
  protected readonly xLabelIndexes = computed(() =>
    thinnedLabelIndexes(this.categories().length, maxLabelsForWidth(this.width())),
  )

  protected readonly groups = computed(() =>
    computeBarGroups(
      this.categories(),
      this.series(),
      this.stacked(),
      this.max(),
      this.plotWidth(),
    ),
  )

  protected readonly hover = new ChartHoverState()
  protected readonly tooltip = computed<ChartTooltipState | null>(() => {
    const index = this.hover.activeIndex()
    if (index === null) return null

    const category = this.categories()[index]
    const group = this.groups()[index]
    if (category === undefined || !group) return null

    const rows: ChartTooltipRow[] = this.series().map((item) => ({
      id: item.id,
      label: item.label,
      colorVar: item.colorVar,
      value: item.values[index] ?? 0,
    }))
    const total = this.stacked() ? rows.reduce((sum, row) => sum + row.value, 0) : null

    return { category, rows, total, xPercent: (group.centerX / this.width()) * 100 }
  })

  protected columnWidth(): number {
    const count = this.categories().length
    return count === 0 ? 0 : this.plotWidth() / count
  }

  protected columnX(index: number): number {
    return CHART_PADDING_LEFT + index * this.columnWidth()
  }

  protected groupCenterX(index: number): number {
    return this.groups()[index]?.centerX ?? 0
  }

  protected tickY(tick: number): number {
    return CHART_PADDING_TOP + CHART_PLOT_HEIGHT - (tick / this.max()) * CHART_PLOT_HEIGHT
  }

  protected tickLabel(tick: number): string {
    return formatChartValue(tick)
  }

  protected axisBottomY(): number {
    return CHART_HEIGHT - CHART_PADDING_BOTTOM
  }

  protected tooltipLabel(index: number): string {
    const parts = this.series().map(
      (item) => `${item.label} ${formatChartValue(item.values[index] ?? 0)}`,
    )
    return `${this.categories()[index] ?? ''}: ${parts.join(', ')}`
  }
}
