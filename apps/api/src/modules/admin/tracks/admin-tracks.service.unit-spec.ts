import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { TrackUploadService } from '@modules/tracks'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'

/** `TrackUploadService` pulls in `music-metadata` via `track-media.ts`; that package
 * cannot be resolved under Jest, so every spec that reaches it mocks it virtually. */
jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

import {
  buildTrack,
  buildTrackProcessingAttempt,
  buildTrackWithArtist,
  buildTrackWithDetail,
} from './__tests__/fixtures/admin-tracks.fixtures'
import { AdminTracksService } from './admin-tracks.service'
import {
  TrackAlreadyDeletedException,
  TrackNotDeletedException,
  TrackNotFoundException,
} from './errors'

const STAFF_ID = 'staff-1'

const makeTrackUploadMock = () =>
  ({
    reprocess: jest.fn(),
  }) as unknown as jest.Mocked<TrackUploadService>

describe('AdminTracksService', () => {
  let service: AdminTracksService
  let prisma: PrismaMock
  let trackUpload: jest.Mocked<TrackUploadService>
  let transaction: DeepMockProxy<Prisma.TransactionClient>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    trackUpload = makeTrackUploadMock()
    transaction = mockDeep<Prisma.TransactionClient>()
    prisma.$transaction.mockImplementation((callback: unknown) =>
      (callback as (client: Prisma.TransactionClient) => unknown)(transaction),
    )
    service = new AdminTracksService(prisma, trackUpload)
  })

  describe('findAll', () => {
    it('hydrates rows in the id order the raw query returned, with artist usernames attached', async () => {
      const failed = buildTrackWithArtist(
        { id: 'track-failed', processingStatus: 'FAILED' },
        'dj-failed',
      )
      const ready = buildTrackWithArtist(
        { id: 'track-ready', processingStatus: 'READY' },
        'dj-ready',
      )

      prisma.queryRaw.mockResolvedValue([{ id: 'track-failed' }, { id: 'track-ready' }] as never)
      prisma.track.count.mockResolvedValue(2)
      // findMany does not preserve `IN` order — return them reversed to prove reordering works.
      prisma.track.findMany.mockResolvedValue([ready, failed] as never)

      const result = await service.findAll({ page: 1, limit: 20 })

      expect(result.total).toBe(2)
      expect(result.data.map((row) => row.id)).toEqual(['track-failed', 'track-ready'])
      expect(result.data[0]?.artistUsername).toBe('dj-failed')
    })

    it('returns an empty page without querying findMany when no ids match', async () => {
      prisma.queryRaw.mockResolvedValue([] as never)
      prisma.track.count.mockResolvedValue(0)

      const result = await service.findAll({})

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 })
      expect(prisma.track.findMany).not.toHaveBeenCalled()
    })

    it('drops an id the second query no longer returns instead of throwing', async () => {
      prisma.queryRaw.mockResolvedValue([{ id: 'gone' }] as never)
      prisma.track.count.mockResolvedValue(1)
      prisma.track.findMany.mockResolvedValue([] as never)

      const result = await service.findAll({})

      expect(result.data).toEqual([])
    })

    it('goes through the raw-SQL problem-first query when no sort is given', async () => {
      prisma.queryRaw.mockResolvedValue([] as never)
      prisma.track.count.mockResolvedValue(0)

      await service.findAll({})

      expect(prisma.queryRaw).toHaveBeenCalledTimes(1)
      expect(prisma.track.findMany).not.toHaveBeenCalled()
    })

    /** A never-dequeued `PROCESSING` track has `processingStartedAt: null` forever — ordering
     * by that column alone with `NULLS LAST` would sink exactly the rows this screen exists to
     * surface to the bottom of their own group. `COALESCE(processingStartedAt, updatedAt)`
     * keeps them near the top instead. */
    it('orders the PROCESSING group by COALESCE(processingStartedAt, updatedAt), not processingStartedAt alone', async () => {
      prisma.queryRaw.mockResolvedValue([] as never)
      prisma.track.count.mockResolvedValue(0)

      await service.findAll({})

      const query = prisma.queryRaw.mock.calls[0]?.[0] as Prisma.Sql
      const sql = query.strings.join(' ')
      expect(sql).toContain('COALESCE("processingStartedAt", "updatedAt") ASC')
      expect(sql).not.toContain('"processingStartedAt" ASC NULLS LAST')
    })

    it('bypasses the raw-SQL query and orders by the chosen field when sort is given', async () => {
      const track = buildTrackWithArtist({ id: 'track-1', title: 'B' }, 'dj-test')
      prisma.track.findMany.mockResolvedValue([track] as never)
      prisma.track.count.mockResolvedValue(1)

      const result = await service.findAll({ sort: 'title', order: 'asc' })

      expect(prisma.queryRaw).not.toHaveBeenCalled()
      const call = prisma.track.findMany.mock.calls[0]?.[0]
      expect(call?.orderBy).toEqual([{ title: 'asc' }, { id: 'asc' }])
      expect(result.data[0]?.id).toBe('track-1')
    })

    it('defaults status to active — excludes soft-deleted tracks from the raw where', async () => {
      prisma.queryRaw.mockResolvedValue([] as never)
      prisma.track.count.mockResolvedValue(0)

      await service.findAll({})

      expect(prisma.track.count).toHaveBeenCalledWith({ where: { deletedAt: null } })
    })

    it('status=deactivated filters to only soft-deleted tracks', async () => {
      prisma.queryRaw.mockResolvedValue([] as never)
      prisma.track.count.mockResolvedValue(0)

      await service.findAll({ status: 'deactivated' })

      expect(prisma.track.count).toHaveBeenCalledWith({ where: { deletedAt: { not: null } } })
    })

    it('status=all drops the deletedAt filter entirely', async () => {
      prisma.queryRaw.mockResolvedValue([] as never)
      prisma.track.count.mockResolvedValue(0)

      await service.findAll({ status: 'all' })

      expect(prisma.track.count).toHaveBeenCalledWith({ where: {} })
    })
  })

  describe('findById', () => {
    it('throws TrackNotFoundException when the track does not exist', async () => {
      prisma.track.findFirst.mockResolvedValue(null)

      await expect(service.findById('missing')).rejects.toThrow(TrackNotFoundException)
    })

    it('returns the detail shape — renditions, credits, genres, albums, open report count', async () => {
      const track = buildTrackWithDetail({ id: 'track-1' }, 'dj-test')
      prisma.track.findFirst.mockResolvedValue(track as never)
      prisma.moderationReport.count.mockResolvedValue(3)

      const result = await service.findById('track-1')

      expect(result.artistUsername).toBe('dj-test')
      expect(result.audioFiles).toEqual([])
      expect(result.openReportCount).toBe(3)
    })

    it('does not filter deletedAt — a soft-deleted track stays reachable by id', async () => {
      const track = buildTrackWithDetail({ id: 'track-1', deletedAt: new Date() }, 'dj-test')
      prisma.track.findFirst.mockResolvedValue(track as never)
      prisma.moderationReport.count.mockResolvedValue(0)

      await service.findById('track-1')

      expect(prisma.track.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'track-1' } }),
      )
    })
  })

  describe('findProcessingAttempts', () => {
    it('throws TrackNotFoundException when the track does not exist', async () => {
      prisma.track.findFirst.mockResolvedValue(null)

      await expect(service.findProcessingAttempts('missing', {})).rejects.toThrow(
        TrackNotFoundException,
      )
    })

    it('does not filter deletedAt — a soft-deleted track stays reachable by id', async () => {
      prisma.track.findFirst.mockResolvedValue(
        buildTrack({ id: 'track-1', deletedAt: new Date() }) as never,
      )
      prisma.trackProcessingAttempt.findMany.mockResolvedValue([])
      prisma.trackProcessingAttempt.count.mockResolvedValue(0)

      await service.findProcessingAttempts('track-1', {})

      expect(prisma.track.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'track-1' } }),
      )
    })

    it('orders newest first and applies pagination defaults', async () => {
      prisma.track.findFirst.mockResolvedValue(buildTrack({ id: 'track-1' }) as never)
      const attempt = buildTrackProcessingAttempt()
      prisma.trackProcessingAttempt.findMany.mockResolvedValue([attempt])
      prisma.trackProcessingAttempt.count.mockResolvedValue(1)

      const result = await service.findProcessingAttempts('track-1', {})

      expect(prisma.trackProcessingAttempt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { trackId: 'track-1' },
          orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
          skip: 0,
          take: 20,
        }),
      )
      expect(result).toEqual({ data: [attempt], total: 1, page: 1, limit: 20 })
    })

    it('applies the given page and limit', async () => {
      prisma.track.findFirst.mockResolvedValue(buildTrack({ id: 'track-1' }) as never)
      prisma.trackProcessingAttempt.findMany.mockResolvedValue([])
      prisma.trackProcessingAttempt.count.mockResolvedValue(45)

      const result = await service.findProcessingAttempts('track-1', { page: 3, limit: 10 })

      expect(prisma.trackProcessingAttempt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      )
      expect(result).toEqual({ data: [], total: 45, page: 3, limit: 10 })
    })
  })

  describe('reprocess', () => {
    it('throws TrackNotFoundException when the track does not exist', async () => {
      prisma.track.findFirst.mockResolvedValue(null)

      await expect(service.reprocess('missing')).rejects.toThrow(TrackNotFoundException)
      expect(trackUpload.reprocess).not.toHaveBeenCalled()
    })

    it('throws TrackAlreadyDeletedException for a soft-deleted track', async () => {
      prisma.track.findFirst.mockResolvedValue(buildTrack({ deletedAt: new Date() }) as never)

      await expect(service.reprocess('track-1')).rejects.toThrow(TrackAlreadyDeletedException)
      expect(trackUpload.reprocess).not.toHaveBeenCalled()
    })

    it('delegates to TrackUploadService.reprocess — reuses the existing producer', async () => {
      prisma.track.findFirst.mockResolvedValue(buildTrack({ id: 'track-1' }) as never)
      trackUpload.reprocess.mockResolvedValue(buildTrack({ id: 'track-1' }) as never)

      await service.reprocess('track-1')

      expect(trackUpload.reprocess).toHaveBeenCalledWith('track-1')
    })
  })

  describe('softDelete', () => {
    it('throws TrackNotFoundException when the track does not exist', async () => {
      prisma.track.findFirst.mockResolvedValue(null)

      await expect(service.softDelete('missing', STAFF_ID)).rejects.toThrow(TrackNotFoundException)
    })

    it('throws TrackAlreadyDeletedException when the track is already deleted', async () => {
      prisma.track.findFirst.mockResolvedValue(buildTrack({ deletedAt: new Date() }) as never)

      await expect(service.softDelete('track-1', STAFF_ID)).rejects.toThrow(
        TrackAlreadyDeletedException,
      )
    })

    /** A second concurrent take-down loses the `updateMany` race — `count` is 0 even though the
     * initial `findFirst` above saw an active row — and must fail the same way as an
     * already-deleted track, a 409 rather than the 404 a genuinely missing track gets. */
    it('throws TrackAlreadyDeletedException when a concurrent request wins the race', async () => {
      prisma.track.findFirst.mockResolvedValue(
        buildTrack({ id: 'track-1', deletedAt: null }) as never,
      )
      transaction.track.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.softDelete('track-1', STAFF_ID)).rejects.toThrow(
        TrackAlreadyDeletedException,
      )
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    it('stamps deletedAt and writes an audit row carrying the reason, in one transaction', async () => {
      prisma.track.findFirst.mockResolvedValue(
        buildTrack({ id: 'track-1', deletedAt: null }) as never,
      )
      transaction.track.updateMany.mockResolvedValue({ count: 1 })
      transaction.track.findFirstOrThrow.mockResolvedValue(
        buildTrackWithArtist({ id: 'track-1', deletedAt: new Date() }, 'dj-test') as never,
      )

      const result = await service.softDelete('track-1', STAFF_ID, 'rights claim')

      expect(transaction.track.updateMany).toHaveBeenCalledWith({
        where: { id: 'track-1', deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      })
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            staffId: STAFF_ID,
            action: 'admin-tracks.delete',
            metadata: expect.objectContaining({ reason: 'rights claim' }),
          }),
        }),
      )
      // The response shape is the operator row (artist username resolved, no raw file fields).
      expect(result).toEqual(expect.objectContaining({ id: 'track-1', artistUsername: 'dj-test' }))
      expect(result).not.toHaveProperty('audioUrl')
      expect(result).not.toHaveProperty('lyrics')
      expect(result).not.toHaveProperty('isrc')
    })
  })

  describe('restore', () => {
    it('throws TrackNotFoundException when the track does not exist', async () => {
      prisma.track.findFirst.mockResolvedValue(null)

      await expect(service.restore('missing', STAFF_ID)).rejects.toThrow(TrackNotFoundException)
    })

    it('throws TrackNotDeletedException when the track is not deleted', async () => {
      prisma.track.findFirst.mockResolvedValue(buildTrack({ deletedAt: null }) as never)

      await expect(service.restore('track-1', STAFF_ID)).rejects.toThrow(TrackNotDeletedException)
    })

    /** A second concurrent restore loses the `updateMany` race and must fail 409, not 404. */
    it('throws TrackNotDeletedException when a concurrent request wins the race', async () => {
      prisma.track.findFirst.mockResolvedValue(
        buildTrack({ id: 'track-1', deletedAt: new Date() }) as never,
      )
      transaction.track.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.restore('track-1', STAFF_ID)).rejects.toThrow(TrackNotDeletedException)
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    it('clears deletedAt and writes an audit row, in one transaction', async () => {
      prisma.track.findFirst.mockResolvedValue(
        buildTrack({ id: 'track-1', deletedAt: new Date() }) as never,
      )
      transaction.track.updateMany.mockResolvedValue({ count: 1 })
      transaction.track.findFirstOrThrow.mockResolvedValue(
        buildTrackWithArtist({ id: 'track-1', deletedAt: null }, 'dj-test') as never,
      )

      await service.restore('track-1', STAFF_ID)

      expect(transaction.track.updateMany).toHaveBeenCalledWith({
        where: { id: 'track-1', deletedAt: { not: null } },
        data: { deletedAt: null },
      })
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'admin-tracks.restore' }),
        }),
      )
    })
  })
})
