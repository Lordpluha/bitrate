import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { AdminAuditService } from '@modules/admin/audit'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { AdminOverviewService, STUCK_AFTER_MS } from './admin-overview.service'

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
})
