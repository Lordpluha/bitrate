import { signal } from '@angular/core'

/**
 * The one bit of interaction state a chart needs: which category index is currently hovered or
 * focused, or `null` for none. Shared by `LineChart` and `BarChart` so the pointer/focus wiring
 * in each template stays identical and the tooltip-visibility logic isn't duplicated per chart.
 */
export class ChartHoverState {
  private readonly index = signal<number | null>(null)

  readonly activeIndex = this.index.asReadonly()

  activate(index: number): void {
    this.index.set(index)
  }

  clear(): void {
    this.index.set(null)
  }
}
