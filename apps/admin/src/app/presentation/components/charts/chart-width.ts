import { effect, type ElementRef, signal, type Signal } from '@angular/core'
import { CHART_WIDTH } from './chart-layout'

/**
 * Watches `target`'s rendered width via `ResizeObserver`, so a chart's SVG `viewBox` can match
 * real pixels 1:1 instead of a fixed logical width the browser then scales to fit — that scaling
 * is what made the same `font-size` render at a different physical size in every card. Starts at
 * `CHART_WIDTH` until the first observation lands (including permanently, in an environment with
 * no `ResizeObserver`, e.g. jsdom under Vitest).
 *
 * `target` is usually a `viewChild` inside a conditional block (the plot only exists once data has
 * loaded), so the observer follows the element: it attaches whenever `target` resolves to one and
 * disconnects when it goes away or the host is destroyed. Call once from a component's
 * constructor or a field initializer — both are injection context.
 */
export function trackChartWidth(
  target: Signal<ElementRef<HTMLElement> | undefined>,
): Signal<number> {
  const width = signal(CHART_WIDTH)

  if (typeof ResizeObserver === 'undefined') return width.asReadonly()

  effect((onCleanup) => {
    const element = target()?.nativeElement
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width
      if (measured && measured > 0) width.set(Math.round(measured))
    })
    observer.observe(element)
    onCleanup(() => observer.disconnect())
  })

  return width.asReadonly()
}
