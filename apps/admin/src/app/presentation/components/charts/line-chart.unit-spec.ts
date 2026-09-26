import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { LineChart } from './line-chart'
import type { ChartSeriesValues } from './chart.types'

const SERIES: ChartSeriesValues[] = [
  { id: 'listeners', label: 'Listeners', colorVar: '--color-chart-1', values: [1, 4, 2] },
  { id: 'artists', label: 'Artists', colorVar: '--color-chart-2', values: [0, 1, 1] },
]

function create(
  series: ChartSeriesValues[],
  categories = ['15 Sep', '16 Sep', '17 Sep'],
): { fixture: ReturnType<typeof TestBed.createComponent<LineChart>>; host: HTMLElement } {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] })

  const fixture = TestBed.createComponent(LineChart)
  fixture.componentRef.setInput('title', 'New accounts per day')
  fixture.componentRef.setInput('description', 'New accounts each UTC day. Values are accounts.')
  fixture.componentRef.setInput('categories', categories)
  fixture.componentRef.setInput('series', series)
  fixture.detectChanges()

  return { fixture, host: fixture.nativeElement as HTMLElement }
}

describe('LineChart', () => {
  it('gives the chart a visible accessible name through its figcaption', () => {
    const { host } = create(SERIES)

    expect(host.querySelector('figcaption')?.textContent).toContain('New accounts per day')
  })

  it('shows the one-line description under the caption', () => {
    const { host } = create(SERIES)

    expect(host.textContent).toContain('New accounts each UTC day. Values are accounts.')
  })

  it('draws one polyline per series, and hides the SVG itself from assistive tech', () => {
    const { host } = create(SERIES)
    const svg = host.querySelector('svg')

    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(svg?.querySelectorAll('polyline').length).toBe(2)
  })

  it('does not distort the drawing to fill its box — no preserveAspectRatio override', () => {
    const { host } = create(SERIES)
    const svg = host.querySelector('svg')

    expect(svg?.getAttribute('preserveAspectRatio')).toBeNull()
  })

  it('draws y-axis ticks rounded to nice numbers, and x-axis labels for the range', () => {
    const { host } = create(SERIES)
    const svg = host.querySelector('svg')
    const labels = Array.from(svg?.querySelectorAll('text') ?? []).map((el) =>
      el.textContent?.trim(),
    )

    expect(labels).toContain('0')
    expect(labels.some((label) => label?.includes('15 Sep'))).toBe(true)
    expect(labels.some((label) => label?.includes('17 Sep'))).toBe(true)
  })

  it('draws the axis lines themselves, not only gridlines', () => {
    const { host } = create(SERIES)
    const svg = host.querySelector('svg')

    expect(svg?.querySelectorAll('line').length ?? 0).toBeGreaterThanOrEqual(2)
  })

  it('sizes the viewBox to the fixed chart height and a positive measured width', () => {
    const { host } = create(SERIES)
    const svg = host.querySelector('svg')
    const [, , widthPart, heightPart] = (svg?.getAttribute('viewBox') ?? '').split(' ')

    expect(Number(heightPart)).toBe(200)
    expect(Number(widthPart)).toBeGreaterThan(0)
  })

  it('sizes every axis label with the shared text-xs scale, never a per-chart font-size', () => {
    const { host } = create(SERIES)
    const labels = Array.from(host.querySelectorAll('svg text'))

    expect(labels.length).toBeGreaterThan(0)
    for (const label of labels) {
      expect(label.getAttribute('font-size')).toBeNull()
      expect(label.getAttribute('class')).toContain('text-xs')
    }
  })

  it('thins x-axis labels using the chart width, never a hardcoded category count', () => {
    const manyCategories = Array.from({ length: 30 }, (_, index) => `Day ${index}`)
    const manySeries: ChartSeriesValues[] = [
      {
        id: 'listeners',
        label: 'Listeners',
        colorVar: '--color-chart-1',
        values: manyCategories.map(() => 1),
      },
    ]
    const { host } = create(manySeries, manyCategories)
    const svg = host.querySelector('svg')
    const xLabelCount = Array.from(svg?.querySelectorAll('text') ?? []).filter((el) =>
      manyCategories.includes(el.textContent?.trim() ?? ''),
    ).length

    expect(xLabelCount).toBeLessThan(manyCategories.length)
    expect(xLabelCount).toBeGreaterThanOrEqual(2)
  })

  it('clips its plot area so an off-centre tooltip can never widen the card', () => {
    const { host } = create(SERIES)
    const plot = host.querySelector('figure > div.relative')

    expect(plot?.className).toContain('overflow-hidden')
  })

  it('never gives a hit-target button a fixed min-width that could overflow the row', () => {
    const { host } = create(SERIES)
    const buttons = Array.from(host.querySelectorAll('.absolute.inset-0.flex > button'))

    expect(buttons.length).toBeGreaterThan(0)
    for (const button of buttons) {
      expect(button.className).not.toMatch(/\bmin-w-/)
    }
  })

  /**
   * Every hover button is an equal `flex-1` slice of the plot, and every point sits at
   * `segmentCenterX` — the centre of that same equal slice (see `chart-scale.ts`) — so a
   * hover region and the point it activates share a centre by construction. Points used to
   * sit edge-to-edge instead (`xPosition`, dividing by `count - 1`), which put every point at
   * a different x-coordinate than an equal-slice `flex-1` overlay already divided the plot
   * into, and no amount of resizing the overlay's regions could fully reconcile the two.
   */
  it('gives every hover button an equal flex-1 share, matching the equal slice each point centres in', () => {
    const { host } = create(SERIES)
    const buttons = Array.from(host.querySelectorAll('.absolute.inset-0.flex > button'))

    expect(buttons.length).toBe(SERIES[0]?.values.length)
    for (const button of buttons) {
      expect(button.className).toContain('flex-1')
      expect((button as HTMLElement).style.width).toBe('')
    }
  })

  it('shows a tooltip with the exact values on hover, and clears it on pointer leave', async () => {
    const { fixture, host } = create(SERIES)
    const button = host.querySelectorAll('button')[1]

    button?.dispatchEvent(new Event('pointerenter'))
    await fixture.whenStable()

    expect(host.textContent).toContain('16 Sep')
    expect(host.textContent).toContain('Listeners')

    button?.dispatchEvent(new Event('pointerleave'))
    await fixture.whenStable()

    expect(host.querySelector('app-chart-tooltip')).toBeNull()
  })

  it('shows the same tooltip content on keyboard focus as on hover', async () => {
    const { fixture, host } = create(SERIES)
    const button = host.querySelectorAll('button')[2]

    button?.dispatchEvent(new Event('focus'))
    await fixture.whenStable()

    expect(host.textContent).toContain('Artists')
    expect(host.querySelector('app-chart-tooltip')).not.toBeNull()
  })

  it('gives every hover target an aria-label carrying the full reading, for screen readers', () => {
    const { host } = create(SERIES)
    const buttons = Array.from(host.querySelectorAll('button'))

    expect(buttons[0]?.getAttribute('aria-label')).toContain('15 Sep')
    expect(buttons[0]?.getAttribute('aria-label')).toContain('Listeners')
  })

  it('carries the full data in a visually-hidden table, one row per category', () => {
    const { host } = create(SERIES)
    const rows = host.querySelectorAll('table.sr-only tbody tr')

    expect(rows.length).toBe(3)
    expect(host.querySelector('table.sr-only')?.textContent).toContain('Listeners')
  })

  it('shows the empty-range message and no chart when every value is zero', () => {
    const empty: ChartSeriesValues[] = [
      { id: 'listeners', label: 'Listeners', colorVar: '--color-chart-1', values: [0, 0, 0] },
    ]
    const { host } = create(empty)

    expect(host.querySelector('svg')).toBeNull()
    expect(host.textContent).toContain('No data for this range.')
  })

  it('shows a headline value beside the title when one is given', () => {
    const { fixture, host } = create(SERIES)
    fixture.componentRef.setInput('headline', { value: '9', label: 'New accounts, 7d' })
    fixture.detectChanges()

    expect(host.textContent).toContain('9')
    expect(host.textContent).toContain('New accounts, 7d')
  })

  it('renders no headline block when none is given', () => {
    const { host } = create(SERIES)
    const figcaptionRow = host.querySelector('figure > div')

    expect(figcaptionRow?.children.length).toBe(1)
  })

  it('shows a loading message and no plot, description and figcaption still visible', () => {
    const { fixture, host } = create(SERIES)
    fixture.componentRef.setInput('loading', true)
    fixture.detectChanges()

    expect(host.querySelector('svg')).toBeNull()
    expect(host.textContent).toContain('Loading')
    expect(host.querySelector('figcaption')?.textContent).toContain('New accounts per day')
  })

  it('shows a failure alert instead of the plot, description and figcaption still visible', () => {
    const { fixture, host } = create(SERIES)
    fixture.componentRef.setInput('failure', 'Could not load this chart.')
    fixture.detectChanges()

    expect(host.querySelector('svg')).toBeNull()
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'Could not load this chart.',
    )
    expect(host.querySelector('figcaption')?.textContent).toContain('New accounts per day')
  })
})
