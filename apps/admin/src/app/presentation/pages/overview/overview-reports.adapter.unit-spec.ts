import type { OverviewReportsByType } from '@domain/overview'
import { describe, expect, it } from 'vitest'
import {
  entityTypeLabel,
  reportsByTypeCategories,
  reportsByTypeChartSeries,
  reportsByTypeDescription,
  reportsByTypeHeadline,
} from './overview-reports.adapter'

function data(overrides: Partial<OverviewReportsByType> = {}): OverviewReportsByType {
  return {
    from: new Date('2026-09-16T00:00:00.000Z'),
    to: new Date('2026-09-17T00:00:00.000Z'),
    days: 2,
    dates: [new Date('2026-09-16T00:00:00.000Z'), new Date('2026-09-17T00:00:00.000Z')],
    series: [
      { entityType: 'track', counts: [1, 2], total: 3 },
      { entityType: 'episode', counts: [0, 4], total: 4 },
    ],
    total: 7,
    ...overrides,
  }
}

describe('overview reports-by-type adapter', () => {
  it('maps each entity type to a labelled, coloured series aligned to the dates', () => {
    expect(reportsByTypeChartSeries(data())).toEqual([
      { id: 'track', label: 'Track', colorVar: '--color-chart-1', values: [1, 2] },
      { id: 'episode', label: 'Episode', colorVar: '--color-muted-foreground', values: [0, 4] },
    ])
  })

  it('gives every entity type a distinct colour', () => {
    const all = (
      ['track', 'album', 'playlist', 'artist', 'podcast', 'episode', 'user'] as const
    ).map((entityType) => ({ entityType, counts: [0], total: 0 }))

    const colors = reportsByTypeChartSeries(data({ series: all })).map((s) => s.colorVar)

    expect(new Set(colors).size).toBe(7)
  })

  it('labels categories with short day-of-month dates', () => {
    const [first, second] = reportsByTypeCategories(data())

    /** ICU versions differ on "Sep" vs "Sept", so match the day and month prefix. */
    expect(first).toMatch(/^16 Sep/)
    expect(second).toMatch(/^17 Sep/)
  })

  it('reports the range total as the headline, and none for the loading placeholder', () => {
    expect(reportsByTypeHeadline(data())).toEqual({ value: '7', label: 'Reports filed, 2d' })
    expect(reportsByTypeHeadline(data({ days: 0 }))).toBeNull()
  })

  it('states the window and the unit in the description', () => {
    expect(reportsByTypeDescription(data())).toContain('last 2 days')
  })

  it('capitalises an entity type for display', () => {
    expect(entityTypeLabel('podcast')).toBe('Podcast')
  })
})
