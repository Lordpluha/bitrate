import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { BarChart } from './bar-chart'
import type { ChartSeriesValues } from './chart.types'

const CATEGORIES = ['16 Sep', '17 Sep']

const STACKED_SERIES: ChartSeriesValues[] = [
  { id: 'ready', label: 'Ready', colorVar: '--color-chart-3', values: [0, 3] },
  { id: 'failed', label: 'Failed', colorVar: '--color-chart-5', values: [0, 1] },
]

type CreateInput = {
  series: ChartSeriesValues[]
  stacked?: boolean
  categories?: string[]
}

function create({ series, stacked = false, categories = CATEGORIES }: CreateInput): {
  fixture: ReturnType<typeof TestBed.createComponent<BarChart>>
  host: HTMLElement
} {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] })

  const fixture = TestBed.createComponent(BarChart)
  fixture.componentRef.setInput('title', 'Uploads by outcome')
  fixture.componentRef.setInput('description', 'Tracks uploaded each UTC day. Values are tracks.')
  fixture.componentRef.setInput('categories', categories)
  fixture.componentRef.setInput('series', series)
  fixture.componentRef.setInput('stacked', stacked)
  fixture.detectChanges()

  return { fixture, host: fixture.nativeElement as HTMLElement }
}

describe('BarChart', () => {
  it('gives the chart a visible accessible name through its figcaption', () => {
    const { host } = create({ series: STACKED_SERIES })

    expect(host.querySelector('figcaption')?.textContent).toContain('Uploads by outcome')
  })

  it('shows the one-line description under the caption', () => {
    const { host } = create({ series: STACKED_SERIES })

    expect(host.textContent).toContain('Tracks uploaded each UTC day. Values are tracks.')
  })

  it('draws one rect per series per category when stacked, and hides the SVG from assistive tech', () => {
    const { host } = create({ series: STACKED_SERIES, stacked: true })
    const svg = host.querySelector('svg')

    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(svg?.querySelectorAll('rect').length).toBe(4)
  })

  it('does not distort the drawing to fill its box — no preserveAspectRatio override', () => {
    const { host } = create({ series: STACKED_SERIES })
    const svg = host.querySelector('svg')

    expect(svg?.getAttribute('preserveAspectRatio')).toBeNull()
  })

  it('draws y-axis ticks rounded to nice numbers, and an x-axis label per category', () => {
    const { host } = create({ series: STACKED_SERIES, stacked: true })
    const svg = host.querySelector('svg')
    const labels = Array.from(svg?.querySelectorAll('text') ?? []).map((el) =>
      el.textContent?.trim(),
    )

    expect(labels).toContain('0')
    expect(labels.some((label) => label?.includes('16 Sep'))).toBe(true)
    expect(labels.some((label) => label?.includes('17 Sep'))).toBe(true)
  })

  it('sizes the viewBox to the fixed chart height and a positive measured width', () => {
    const { host } = create({ series: STACKED_SERIES })
    const svg = host.querySelector('svg')
    const [, , widthPart, heightPart] = (svg?.getAttribute('viewBox') ?? '').split(' ')

    expect(Number(heightPart)).toBe(200)
    expect(Number(widthPart)).toBeGreaterThan(0)
  })

  it('sizes every axis label with the shared text-xs scale, never a per-chart font-size', () => {
    const { host } = create({ series: STACKED_SERIES, stacked: true })
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
      { id: 'ready', label: 'Ready', colorVar: '--color-chart-3', values: manyCategories.map(() => 1) },
    ]
    const { host } = create({ series: manySeries, categories: manyCategories })
    const svg = host.querySelector('svg')
    const xLabelCount = Array.from(svg?.querySelectorAll('text') ?? []).filter(
      (el) => el.getAttribute('text-anchor') === 'middle',
    ).length

    expect(xLabelCount).toBeLessThan(manyCategories.length)
    expect(xLabelCount).toBeGreaterThanOrEqual(2)
  })

  it('clips its plot area so an off-centre tooltip can never widen the card', () => {
    const { host } = create({ series: STACKED_SERIES })
    const plot = host.querySelector('figure > div.relative')

    expect(plot?.className).toContain('overflow-hidden')
  })

  it('never gives a hit-target button a fixed min-width that could overflow the row', () => {
    const { host } = create({ series: STACKED_SERIES })
    const buttons = Array.from(host.querySelectorAll('.absolute.inset-0.flex > button'))

    expect(buttons.length).toBeGreaterThan(0)
    for (const button of buttons) {
      expect(button.className).not.toMatch(/\bmin-w-/)
    }
  })

  it('shows a tooltip with every series and the stacked total on hover', async () => {
    const { fixture, host } = create({ series: STACKED_SERIES, stacked: true })
    const button = host.querySelectorAll('button')[1]

    button?.dispatchEvent(new Event('pointerenter'))
    await fixture.whenStable()

    expect(host.textContent).toContain('17 Sep')
    expect(host.textContent).toContain('Ready')
    expect(host.textContent).toContain('Failed')
    expect(host.textContent).toContain('Total')
  })

  it('shows no total in the tooltip for a non-stacked chart', async () => {
    const { fixture, host } = create({ series: STACKED_SERIES, stacked: false })
    const button = host.querySelectorAll('button')[1]

    button?.dispatchEvent(new Event('focus'))
    await fixture.whenStable()

    expect(host.textContent).not.toContain('Total')
  })

  it('carries the full data in a visually-hidden table, one row per category', () => {
    const { host } = create({ series: STACKED_SERIES })
    const rows = host.querySelectorAll('table.sr-only tbody tr')

    expect(rows.length).toBe(2)
    expect(host.querySelector('table.sr-only')?.textContent).toContain('Ready')
  })

  it('shows the empty-range message and no chart when every value is zero', () => {
    const empty: ChartSeriesValues[] = [
      { id: 'reports', label: 'Reports', colorVar: '--color-chart-5', values: [0, 0] },
    ]
    const { host } = create({ series: empty })

    expect(host.querySelector('svg')).toBeNull()
    expect(host.textContent).toContain('No data for this range.')
  })

  it('shows a headline value beside the title when one is given', () => {
    const { fixture, host } = create({ series: STACKED_SERIES })
    fixture.componentRef.setInput('headline', { value: '4', label: 'Uploads, 7d' })
    fixture.detectChanges()

    expect(host.textContent).toContain('4')
    expect(host.textContent).toContain('Uploads, 7d')
  })

  it('renders no headline block when none is given', () => {
    const { host } = create({ series: STACKED_SERIES })
    const figcaptionRow = host.querySelector('figure > div')

    expect(figcaptionRow?.children.length).toBe(1)
  })

  it('shows a loading message and no plot, description and figcaption still visible', () => {
    const { fixture, host } = create({ series: STACKED_SERIES })
    fixture.componentRef.setInput('loading', true)
    fixture.detectChanges()

    expect(host.querySelector('svg')).toBeNull()
    expect(host.textContent).toContain('Loading')
    expect(host.querySelector('figcaption')?.textContent).toContain('Uploads by outcome')
  })

  it('shows a failure alert instead of the plot, description and figcaption still visible', () => {
    const { fixture, host } = create({ series: STACKED_SERIES })
    fixture.componentRef.setInput('failure', 'Could not load this chart.')
    fixture.detectChanges()

    expect(host.querySelector('svg')).toBeNull()
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'Could not load this chart.',
    )
    expect(host.querySelector('figcaption')?.textContent).toContain('Uploads by outcome')
  })

})
