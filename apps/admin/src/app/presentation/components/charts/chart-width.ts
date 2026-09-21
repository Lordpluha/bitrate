import { afterNextRender, DestroyRef, type ElementRef, inject, signal, type Signal } from '@angular/core'
import { CHART_WIDTH } from './chart-layout'

/**
 * Watches `target`'s rendered width via `ResizeObserver`, so a chart's SVG `viewBox` can match
 * real pixels 1:1 instead of a fixed logical width the browser then scales to fit — that scaling
 * is what made the same `font-size` render at a different physical size in every card. Starts at
 * `CHART_WIDTH` until the first observation lands (including permanently, in an environment with
 * no `ResizeObserver`, e.g. jsdom under Vitest), and disconnects itself when the host is
 * destroyed. Call once from a component's constructor or a field initializer — both are injection
 * context.
 */
export function trackChartWidth(target: Signal<ElementRef<HTMLElement> | undefined>): Signal<number> {
  const width = signal(CHART_WIDTH)

  if (typeof ResizeObserver === 'undefined') return width.asReadonly()

  let observer: ResizeObserver | null = null

  afterNextRender(() => {
    const element = target()?.nativeElement
    if (!element) return

    observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width
      if (measured && measured > 0) width.set(Math.round(measured))
    })
    observer.observe(element)
  })

  inject(DestroyRef).onDestroy(() => observer?.disconnect())

  return width.asReadonly()
}
