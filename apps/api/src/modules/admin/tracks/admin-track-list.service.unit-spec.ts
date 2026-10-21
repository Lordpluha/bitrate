import { beforeEach, describe, expect, it } from '@jest/globals'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildTrackWithArtist } from './__tests__/fixtures/admin-tracks.fixtures'
import { AdminTrackListService } from './admin-track-list.service'

describe('AdminTrackListService', () => {
  let service: AdminTrackListService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new AdminTrackListService(prisma)
  })

  describe('findAll', () => {
    it('hydrates rows in the id order the raw query returned, with artist usernames attached', async () => {
      const failed = buildTrackWithArtist(
        { id: 'track-failed', processingStatus: 'FAILED', cover: 'failed-cover.png' },
        'dj-failed',
      )
      const ready = buildTrackWithArtist(
        { id: 'track-ready', processingStatus: 'READY', cover: null },
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
      expect(result.data[0]?.cover).toBe('failed-cover.png')
      expect(result.data[1]?.cover).toBeNull()
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
})
