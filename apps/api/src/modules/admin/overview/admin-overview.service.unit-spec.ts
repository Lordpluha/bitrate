import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { AdminAuditService } from '@modules/admin/audit'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { AdminOverviewService, STUCK_AFTER_MS } from './admin-overview.service'
import { GetOverviewSeriesQuerySchema, MAX_OVERVIEW_SERIES_DAYS } from './dtos'

const NOW = new Date('2026-09-17T12:00:00.000Z')

/** Loosely typed args shape shared by the count-mock helpers below — enough to branch on. */
type CountArgs = {
  where?: {
    status?: string
    processingStatus?: string
    deletedAt?: unknown
    createdAt?: { gte: Date }
    OR?: [
      { processingStartedAt: { lt: Date } },
      { processingStartedAt: null; updatedAt: { lt: Date } },
    ]
  }
}

const makeAuditMock = () =>
  ({
    findRecent: jest.fn(),
  }) as unknown as jest.Mocked<AdminAuditService>

/** The subset of jest's mock API this spec needs from `groupBy`, which is overloaded and so
 * can't carry jest matchers through `jest-mock-extended`'s proxy directly. */
type GroupByMock = { mockResolvedValue: (value: unknown[]) => void }

/** `groupBy` is overloaded, so jest-mock-extended can't attach jest matchers to it directly. */
const groupByMock = (prisma: PrismaMock) => prisma.track.groupBy as unknown as GroupByMock

/** Same overload problem as {@link groupByMock}, for `moderationReport.groupBy`. */
const reportGroupByMock = (prisma: PrismaMock) =>
  prisma.moderationReport.groupBy as unknown as GroupByMock

/** The subset of jest's mock API this spec needs from `queryRaw`, called multiple times per
 * `getSeries()` call with a different SQL fragment each time — resolved in call order. */
type QueryRawMock = { mockResolvedValueOnce: (value: unknown[]) => QueryRawMock }

const queryRawMock = (prisma: PrismaMock) => prisma.queryRaw as unknown as QueryRawMock

describe('AdminOverviewService', () => {
  let service: AdminOverviewService
  let prisma: PrismaMock
  let audit: jest.Mocked<AdminAuditService>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    audit = makeAuditMock()
    service = new AdminOverviewService(prisma, audit)

    jest.useFakeTimers()
    jest.setSystemTime(NOW)

    prisma.moderationReport.count.mockResolvedValue(0)
    groupByMock(prisma).mockResolvedValue([])
    prisma.track.count.mockResolvedValue(0)
    prisma.user.count.mockResolvedValue(0)
    prisma.artist.count.mockResolvedValue(0)
    audit.findRecent.mockResolvedValue([])
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('aggregates counts and the recent-activity list into the response shape', async () => {
    prisma.moderationReport.count.mockImplementation(((args?: CountArgs) =>
      Promise.resolve(args?.where?.status === 'OPEN' ? 3 : 2)) as never)
    groupByMock(prisma).mockResolvedValue([
      { processingStatus: 'PROCESSING', _count: { _all: 4 } },
      { processingStatus: 'READY', _count: { _all: 50 } },
      { processingStatus: 'FAILED', _count: { _all: 1 } },
    ])
    prisma.track.count.mockImplementation(((args?: CountArgs) =>
      Promise.resolve(args?.where?.processingStatus === 'PROCESSING' ? 2 : 5)) as never)
    prisma.user.count.mockResolvedValue(7)
    prisma.artist.count.mockResolvedValue(1)
    const recentRow = { id: 'log-1', actorUsername: 'fixture-moderator' }
    audit.findRecent.mockResolvedValue([recentRow] as never)

    const result = await service.getOverview()

    expect(result).toEqual({
      reports: { open: 3, reviewing: 2 },
      tracks: { processing: 4, ready: 50, failed: 1, stuck: 2, stuckAfterMs: STUCK_AFTER_MS },
      deactivated: { users: 7, artists: 1 },
      last7Days: { signups: 8, uploads: 5 },
      recentActivity: [recentRow],
    })
    expect(audit.findRecent).toHaveBeenCalledWith(10)
  })

  it('computes the stuck cut from the current instant, not a hardcoded date', async () => {
    await service.getOverview()

    const call = prisma.track.count.mock.calls.find(
      ([args]) => (args as CountArgs | undefined)?.where?.processingStatus === 'PROCESSING',
    )
    expect(call).toBeDefined()
    const where = (call?.[0] as CountArgs).where
    expect(where?.OR?.[0]?.processingStartedAt.lt.getTime()).toBe(NOW.getTime() - STUCK_AFTER_MS)
  })

  it('falls back to updatedAt for a track a worker never dequeued (processingStartedAt null)', async () => {
    await service.getOverview()

    const call = prisma.track.count.mock.calls.find(
      ([args]) => (args as CountArgs | undefined)?.where?.processingStatus === 'PROCESSING',
    )
    expect(call).toBeDefined()
    const where = (call?.[0] as CountArgs).where
    expect(where?.OR?.[1]).toEqual({
      processingStartedAt: null,
      updatedAt: { lt: new Date(NOW.getTime() - STUCK_AFTER_MS) },
    })
  })

  it('returns all zeros and an empty recent-activity list against an empty database', async () => {
    const result = await service.getOverview()

    expect(result).toEqual({
      reports: { open: 0, reviewing: 0 },
      tracks: { processing: 0, ready: 0, failed: 0, stuck: 0, stuckAfterMs: STUCK_AFTER_MS },
      deactivated: { users: 0, artists: 0 },
      last7Days: { signups: 0, uploads: 0 },
      recentActivity: [],
    })
  })

  it('propagates a Prisma rejection instead of swallowing it', async () => {
    prisma.moderationReport.count.mockRejectedValue(new Error('connection lost'))

    await expect(service.getOverview()).rejects.toThrow('connection lost')
  })

  it('computes the 7-day cutoff from the current instant, not a hardcoded date', async () => {
    await service.getOverview()

    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    for (const mock of [prisma.user.count, prisma.artist.count, prisma.track.count]) {
      const call = mock.mock.calls.find(
        ([args]) => (args as CountArgs | undefined)?.where?.createdAt !== undefined,
      )
      expect(call).toBeDefined()
      const where = (call?.[0] as CountArgs).where
      expect(where?.createdAt?.gte.getTime()).toBe(NOW.getTime() - sevenDaysMs)
    }
  })

  it('counts signups and uploads created in the window regardless of a later soft-delete', async () => {
    await service.getOverview()

    for (const mock of [prisma.user.count, prisma.artist.count, prisma.track.count]) {
      const call = mock.mock.calls.find(
        ([args]) => (args as CountArgs | undefined)?.where?.createdAt !== undefined,
      )
      expect(call).toBeDefined()
      const where = (call?.[0] as CountArgs).where
      expect(where).not.toHaveProperty('deletedAt')
    }
  })

  describe('getSeries', () => {
    /** Queues five empty raw-row results — one per `$queryRaw` call `getSeries()` makes, in
     * call order (uploads, listeners, artists, listens, reports) — plus an empty status
     * breakdown, so a test can override only the calls it cares about. */
    const queueEmptyRawResults = () => {
      const raw = queryRawMock(prisma)
      raw.mockResolvedValueOnce([])
      raw.mockResolvedValueOnce([])
      raw.mockResolvedValueOnce([])
      raw.mockResolvedValueOnce([])
      raw.mockResolvedValueOnce([])
      reportGroupByMock(prisma).mockResolvedValue([])
    }

    it('zero-fills every day in the window against an empty database', async () => {
      queueEmptyRawResults()

      const result = await service.getSeries(3)

      expect(result).toEqual({
        from: '2026-09-15',
        to: '2026-09-17',
        days: 3,
        uploads: [
          { date: '2026-09-15', uploaded: 0, ready: 0, failed: 0, stuck: 0 },
          { date: '2026-09-16', uploaded: 0, ready: 0, failed: 0, stuck: 0 },
          { date: '2026-09-17', uploaded: 0, ready: 0, failed: 0, stuck: 0 },
        ],
        signups: [
          { date: '2026-09-15', listeners: 0, artists: 0 },
          { date: '2026-09-16', listeners: 0, artists: 0 },
          { date: '2026-09-17', listeners: 0, artists: 0 },
        ],
        listens: [
          { date: '2026-09-15', count: 0 },
          { date: '2026-09-16', count: 0 },
          { date: '2026-09-17', count: 0 },
        ],
        reports: [
          { date: '2026-09-15', count: 0 },
          { date: '2026-09-16', count: 0 },
          { date: '2026-09-17', count: 0 },
        ],
        reportsByStatus: { open: 0, reviewing: 0, resolved: 0, rejected: 0 },
      })
    })

    it('defaults to a 30-day window when `days` is omitted', async () => {
      queueEmptyRawResults()

      const result = await service.getSeries()

      expect(result.days).toBe(30)
      expect(result.uploads).toHaveLength(30)
      expect(result.from).toBe('2026-08-19')
      expect(result.to).toBe('2026-09-17')
    })

    it('places a populated day at its own bucket and leaves the rest zero-filled', async () => {
      const raw = queryRawMock(prisma)
      raw.mockResolvedValueOnce([
        { day: new Date('2026-09-16T00:00:00.000Z'), uploaded: 5, ready: 3, failed: 1, stuck: 1 },
      ])
      raw.mockResolvedValueOnce([{ day: new Date('2026-09-16T00:00:00.000Z'), count: 2 }])
      raw.mockResolvedValueOnce([{ day: new Date('2026-09-17T00:00:00.000Z'), count: 1 }])
      raw.mockResolvedValueOnce([{ day: new Date('2026-09-15T00:00:00.000Z'), count: 9 }])
      raw.mockResolvedValueOnce([{ day: new Date('2026-09-16T00:00:00.000Z'), count: 4 }])
      reportGroupByMock(prisma).mockResolvedValue([])

      const result = await service.getSeries(3)

      expect(result.uploads).toEqual([
        { date: '2026-09-15', uploaded: 0, ready: 0, failed: 0, stuck: 0 },
        { date: '2026-09-16', uploaded: 5, ready: 3, failed: 1, stuck: 1 },
        { date: '2026-09-17', uploaded: 0, ready: 0, failed: 0, stuck: 0 },
      ])
      expect(result.signups).toEqual([
        { date: '2026-09-15', listeners: 0, artists: 0 },
        { date: '2026-09-16', listeners: 2, artists: 0 },
        { date: '2026-09-17', listeners: 0, artists: 1 },
      ])
      expect(result.listens).toEqual([
        { date: '2026-09-15', count: 9 },
        { date: '2026-09-16', count: 0 },
        { date: '2026-09-17', count: 0 },
      ])
      expect(result.reports).toEqual([
        { date: '2026-09-15', count: 0 },
        { date: '2026-09-16', count: 4 },
        { date: '2026-09-17', count: 0 },
      ])
    })

    it('maps the current report status breakdown regardless of the window', async () => {
      queueEmptyRawResults()
      reportGroupByMock(prisma).mockResolvedValue([
        { status: 'OPEN', _count: { _all: 3 } },
        { status: 'REVIEWING', _count: { _all: 1 } },
        { status: 'RESOLVED', _count: { _all: 8 } },
        { status: 'REJECTED', _count: { _all: 2 } },
      ])

      const result = await service.getSeries(3)

      expect(result.reportsByStatus).toEqual({ open: 3, reviewing: 1, resolved: 8, rejected: 2 })
    })

    it('rejects a `days` outside the schema bound before the service is ever called', () => {
      expect(GetOverviewSeriesQuerySchema.safeParse({ days: 0 }).success).toBe(false)
      expect(
        GetOverviewSeriesQuerySchema.safeParse({ days: MAX_OVERVIEW_SERIES_DAYS + 1 }).success,
      ).toBe(false)
      expect(GetOverviewSeriesQuerySchema.safeParse({ days: 'nope' }).success).toBe(false)
      expect(GetOverviewSeriesQuerySchema.safeParse({}).success).toBe(true)
    })
  })
})
