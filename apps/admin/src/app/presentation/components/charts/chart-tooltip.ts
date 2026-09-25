import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { formatChartValue } from './chart-format'
import type { ChartTooltipState } from './chart-tooltip.types'

/**
 * The hover/focus readout for a chart: an HTML overlay (not an SVG `<title>`) positioned above
 * the hovered/focused column, so it can be styled with design tokens and shown identically on
 * keyboard focus. Purely presentational — `LineChart`/`BarChart` own when it's visible and where.
 */
@Component({
  selector: 'app-chart-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart-tooltip.html',
})
export class ChartTooltip {
  readonly state = input.required<ChartTooltipState>()

  protected readonly left = computed(() => {
    const percent = Math.min(92, Math.max(8, this.state().xPercent))
    return `${percent}%`
  })

  protected format(value: number): string {
    return formatChartValue(value)
  }
}
