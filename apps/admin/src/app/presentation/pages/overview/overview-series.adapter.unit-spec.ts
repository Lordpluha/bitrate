import type { OverviewSeries } from '@domain/overview'
import { describe, expect, it } from 'vitest'
import {
  listensChartDescription,
  rangeSummary,
  reportsByStatusChartDescription,
  reportsByStatusChartSeries,
  reportsChartDescription,
  reportsChartSeries,
  seriesCategories,
  signupsChartDescription,
  signupsChartHeadline,
  signupsChartSeries,
  uploadsChartDescription,
  uploadsChartHeadline,
  uploadsChartSeries,
} from './overview-series.adapter'

function series(overrides: Partial<OverviewSeries> = {}): OverviewSeries {
  return {
    from: new Date('2026-09-10T00:00:00.000Z'),
    to: new Date('2026-09-17T00:00:00.000Z'),
    days: 7,
    uploads: [
      { date: new Date('2026-09-16T00:00:00.000Z'), uploaded: 0, ready: 0, failed: 0, stuck: 0 },
      { date: new Date('2026-09-17T00:00:00.000Z'), uploaded: 4, ready: 3, failed: 1, stuck: 0 },
    ],
    signups: [
      { date: new Date('2026-09-16T00:00:00.000Z'), listeners: 0, artists: 0 },
      { date: new Date('2026-09-17T00:00:00.000Z'), listeners: 2, artists: 1 },
    ],
    listens: [
      { date: new Date('2026-09-16T00:00:00.000Z'), count: 0 },
      { date: new Date('2026-09-17T00:00:00.000Z'), count: 40 },
    ],
    reports: [
      { date: new Date('2026-09-16T00:00:00.000Z'), count: 0 },
      { date: new Date('2026-09-17T00:00:00.000Z'), count: 1 },
    ],
    reportsByStatus: { open: 3, reviewing: 1, resolved: 2, rejected: 0 },
    ...overrides,
  }
}

describe('seriesCategories', () => {
  it('builds one short day label per uploads point', () => {
    expect(seriesCategories(series())).toHaveLength(2)
  })
})

describe('uploadsChartSeries', () => {
  it('builds ready/failed/stuck series aligned to the day points', () => {
    const result = uploadsChartSeries(series())

    expect(result.map((one) => one.id)).toEqual(['ready', 'failed', 'stuck'])
    expect(result.find((one) => one.id === 'ready')?.values).toEqual([0, 3])
  })
})

describe('signupsChartSeries', () => {
  it('builds a listeners and artists series', () => {
    const result = signupsChartSeries(series())

    expect(result.map((one) => one.id)).toEqual(['listeners', 'artists'])
  })
})

describe('reportsChartSeries', () => {
  it('keeps a zero-filled gap day rather than dropping it', () => {
    const result = reportsChartSeries(series())

    expect(result[0]?.values).toEqual([0, 1])
  })
})

describe('reportsByStatusChartSeries', () => {
  it('builds a single series over the four status categories', () => {
    const result = reportsByStatusChartSeries(series())

    expect(result).toHaveLength(1)
    expect(result[0]?.values).toEqual([3, 1, 2, 0])
  })
})

describe('chart descriptions', () => {
  it('state the window, the UTC bucketing, and the unit for each time-series chart', () => {
    const window = series()

    expect(signupsChartDescription(window)).toContain('7 days')
    expect(signupsChartDescription(window)).toContain('UTC')
    expect(signupsChartDescription(window)).toContain('accounts')

    expect(listensChartDescription(window)).toContain('UTC')
    expect(listensChartDescription(window)).toContain('listens')

    expect(uploadsChartDescription(window)).toContain('UTC')
    expect(uploadsChartDescription(window)).toContain('tracks')

    expect(reportsChartDescription(window)).toContain('UTC')
    expect(reportsChartDescription(window)).toContain('reports')
  })

  it('describes the status breakdown as a current snapshot, not a UTC day window', () => {
    expect(reportsByStatusChartDescription()).toContain('current status')
    expect(reportsByStatusChartDescription()).not.toContain('UTC day')
  })
})

describe('rangeSummary', () => {
  it('states the window length and the account/listen totals', () => {
    const summary = rangeSummary(series())

    expect(summary).toContain('7 days')
    expect(summary).toContain('3 new accounts')
    expect(summary).toContain('40 listens')
  })

  it('reports zero totals for an empty window rather than throwing', () => {
    const empty = series({ signups: [], listens: [] })

    expect(rangeSummary(empty)).toContain('0 new accounts')
  })
})

describe('signupsChartHeadline', () => {
  it('sums listeners and artists across the whole range, labelled with the range length', () => {
    const headline = signupsChartHeadline(series())

    expect(headline).toEqual({ value: '3', label: 'New accounts, 7d' })
  })

  it('is null for the loading-placeholder series, never "0"', () => {
    expect(signupsChartHeadline(series({ days: 0, signups: [] }))).toBeNull()
  })

  it('reports zero for a real, loaded range with no signups', () => {
    const headline = signupsChartHeadline(
      series({
        signups: [
          { date: new Date('2026-09-17T00:00:00.000Z'), listeners: 0, artists: 0 },
        ],
      }),
    )

    expect(headline).toEqual({ value: '0', label: 'New accounts, 7d' })
  })
})

describe('uploadsChartHeadline', () => {
  it('sums the daily uploaded total across the whole range, labelled with the range length', () => {
    const headline = uploadsChartHeadline(series())

    expect(headline).toEqual({ value: '4', label: 'Uploads, 7d' })
  })

  it('is null for the loading-placeholder series, never "0"', () => {
    expect(uploadsChartHeadline(series({ days: 0, uploads: [] }))).toBeNull()
  })
})
