import { describe, expect, it } from 'vitest'
import { overviewSeriesDto } from './overview-series.dto'
import { toOverviewSeries } from './overview-series.mapper'

const RAW = {
  from: '2026-08-19',
  to: '2026-09-17',
  days: 30,
  uploads: [
    { date: '2026-09-16', uploaded: 0, ready: 0, failed: 0, stuck: 0 },
    { date: '2026-09-17', uploaded: 4, ready: 3, failed: 1, stuck: 0 },
  ],
  signups: [{ date: '2026-09-17', listeners: 2, artists: 1 }],
  listens: [{ date: '2026-09-17', count: 40 }],
  reports: [{ date: '2026-09-17', count: 1 }],
  reportsByStatus: { open: 3, reviewing: 1, resolved: 2, rejected: 0 },
}

describe('overviewSeriesDto + toOverviewSeries', () => {
  it('parses a realistic AdminOverviewSeriesEntity payload into the domain shape', () => {
    const dto = overviewSeriesDto.parse(RAW)
    const series = toOverviewSeries(dto)

    expect(series.from).toEqual(new Date('2026-08-19'))
    expect(series.to).toEqual(new Date('2026-09-17'))
    expect(series.days).toBe(30)
    expect(series.reportsByStatus).toEqual({ open: 3, reviewing: 1, resolved: 2, rejected: 0 })
  })

  it('keeps a zero-filled gap day intact rather than dropping it', () => {
    const dto = overviewSeriesDto.parse(RAW)
    const series = toOverviewSeries(dto)

    expect(series.uploads).toHaveLength(2)
    expect(series.uploads[0]).toEqual({
      date: new Date('2026-09-16'),
      uploaded: 0,
      ready: 0,
      failed: 0,
      stuck: 0,
    })
  })

  it('converts every point date string to a Date', () => {
    const dto = overviewSeriesDto.parse(RAW)
    const series = toOverviewSeries(dto)

    expect(series.signups[0]?.date).toBeInstanceOf(Date)
    expect(series.listens[0]?.date).toBeInstanceOf(Date)
    expect(series.reports[0]?.date).toBeInstanceOf(Date)
  })

  it('throws on a payload missing a required field', () => {
    const { reportsByStatus: _reportsByStatus, ...withoutStatus } = RAW

    expect(() => overviewSeriesDto.parse(withoutStatus)).toThrow()
  })

  it('throws when a day string is not a valid calendar date', () => {
    const malformed = { ...RAW, from: 'not-a-date' }

    expect(() => overviewSeriesDto.parse(malformed)).toThrow()
  })
})
