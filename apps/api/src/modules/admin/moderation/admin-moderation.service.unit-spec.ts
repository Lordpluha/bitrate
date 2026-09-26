import { beforeEach, describe, expect, it } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { AdminModerationService } from './admin-moderation.service'
import { ReportNotFoundException } from './errors'

const REPORT = {
  id: 'report-1',
  reporterId: 'user-1',
  entityType: 'track',
  entityId: 'track-1',
  reason: 'spam',
  details: null,
  status: 'OPEN',
  resolvedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('AdminModerationService', () => {
  let service: AdminModerationService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new AdminModerationService(prisma)
  })

  describe('findAll', () => {
    it('returns a paginated page filtered by status', async () => {
      prisma.moderationReport.findMany.mockResolvedValue([REPORT] as never)
      prisma.moderationReport.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 2, limit: 5, status: 'OPEN' })

      expect(result).toEqual({ data: [REPORT], total: 1, page: 2, limit: 5 })
      expect(prisma.moderationReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'OPEN' }, skip: 5, take: 5 }),
      )
    })

    it('filters by entityType', async () => {
      prisma.moderationReport.findMany.mockResolvedValue([] as never)
      prisma.moderationReport.count.mockResolvedValue(0)

      await service.findAll({ entityType: 'playlist' })

      expect(prisma.moderationReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { entityType: 'playlist' } }),
      )
    })

    it('orders by createdAt desc with an id tie-break when no sort is given', async () => {
      prisma.moderationReport.findMany.mockResolvedValue([] as never)
      prisma.moderationReport.count.mockResolvedValue(0)

      await service.findAll({})

      const call = prisma.moderationReport.findMany.mock.calls[0]?.[0]
      expect(call?.orderBy).toEqual([{ createdAt: 'desc' }, { id: 'desc' }])
    })

    it('orders by the chosen field with a matching-direction id tie-break', async () => {
      prisma.moderationReport.findMany.mockResolvedValue([] as never)
      prisma.moderationReport.count.mockResolvedValue(0)

      await service.findAll({ sort: 'status', order: 'asc' })

      const call = prisma.moderationReport.findMany.mock.calls[0]?.[0]
      expect(call?.orderBy).toEqual([{ status: 'asc' }, { id: 'asc' }])
    })
  })

  describe('findById', () => {
    beforeEach(() => {
      prisma.moderationReport.findMany.mockResolvedValue([] as never)
    })

    it('throws ReportNotFoundException when the report does not exist', async () => {
      prisma.moderationReport.findFirst.mockResolvedValue(null)

      await expect(service.findById('missing')).rejects.toThrow(ReportNotFoundException)
    })

    it('resolves a track subject', async () => {
      prisma.moderationReport.findFirst.mockResolvedValue(REPORT as never)
      prisma.track.findUnique.mockResolvedValue({
        id: 'track-1',
        title: 'A Song',
        deletedAt: null,
      } as never)

      const result = await service.findById('report-1')

      expect(result.subject).toEqual({
        kind: 'track',
        id: 'track-1',
        title: 'A Song',
        deletedAt: null,
        parentId: null,
      })
      expect(result.siblingReports).toEqual([])
    })

    it('resolves an album subject', async () => {
      const report = { ...REPORT, entityType: 'album', entityId: 'album-1' }
      prisma.moderationReport.findFirst.mockResolvedValue(report as never)
      prisma.album.findUnique.mockResolvedValue({
        id: 'album-1',
        title: 'An Album',
        deletedAt: null,
      } as never)

      const result = await service.findById('report-1')

      expect(result.subject?.kind).toBe('album')
    })

    it('resolves a playlist subject', async () => {
      const report = { ...REPORT, entityType: 'playlist', entityId: 'playlist-1' }
      prisma.moderationReport.findFirst.mockResolvedValue(report as never)
      prisma.playlist.findUnique.mockResolvedValue({
        id: 'playlist-1',
        title: 'A Playlist',
        deletedAt: null,
      } as never)

      const result = await service.findById('report-1')

      expect(result.subject?.kind).toBe('playlist')
    })

    it('resolves an artist subject by username', async () => {
      const report = { ...REPORT, entityType: 'artist', entityId: 'artist-1' }
      prisma.moderationReport.findFirst.mockResolvedValue(report as never)
      prisma.artist.findUnique.mockResolvedValue({
        id: 'artist-1',
        username: 'dj-test',
        deletedAt: null,
      } as never)

      const result = await service.findById('report-1')

      expect(result.subject).toEqual({
        kind: 'artist',
        id: 'artist-1',
        title: 'dj-test',
        deletedAt: null,
        parentId: null,
      })
    })

    it('resolves a podcast subject', async () => {
      const report = { ...REPORT, entityType: 'podcast', entityId: 'podcast-1' }
      prisma.moderationReport.findFirst.mockResolvedValue(report as never)
      prisma.podcast.findUnique.mockResolvedValue({
        id: 'podcast-1',
        title: 'A Podcast',
        deletedAt: null,
      } as never)

      const result = await service.findById('report-1')

      expect(result.subject?.kind).toBe('podcast')
    })

    it('resolves an episode subject, with its parent podcast id', async () => {
      const report = { ...REPORT, entityType: 'episode', entityId: 'episode-1' }
      prisma.moderationReport.findFirst.mockResolvedValue(report as never)
      prisma.episode.findUnique.mockResolvedValue({
        id: 'episode-1',
        title: 'An Episode',
        deletedAt: null,
        podcastId: 'podcast-1',
      } as never)

      const result = await service.findById('report-1')

      expect(result.subject?.kind).toBe('episode')
      expect(result.subject?.parentId).toBe('podcast-1')
    })

    it('resolves a user subject by username', async () => {
      const report = { ...REPORT, entityType: 'user', entityId: 'user-2' }
      prisma.moderationReport.findFirst.mockResolvedValue(report as never)
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-2',
        username: 'listener-2',
        deletedAt: null,
      } as never)

      const result = await service.findById('report-1')

      expect(result.subject).toEqual({
        kind: 'user',
        id: 'user-2',
        title: 'listener-2',
        deletedAt: null,
        parentId: null,
      })
    })

    it('resolves to a null subject for an unrecognised entityType — never throws', async () => {
      const report = { ...REPORT, entityType: 'comment', entityId: 'comment-1' }
      prisma.moderationReport.findFirst.mockResolvedValue(report as never)

      const result = await service.findById('report-1')

      expect(result.subject).toBeNull()
    })

    it('resolves to a null subject when the referenced row no longer exists', async () => {
      prisma.moderationReport.findFirst.mockResolvedValue(REPORT as never)
      prisma.track.findUnique.mockResolvedValue(null)

      const result = await service.findById('report-1')

      expect(result.subject).toBeNull()
    })

    it('returns sibling reports on the same subject, excluding itself', async () => {
      prisma.moderationReport.findFirst.mockResolvedValue(REPORT as never)
      prisma.track.findUnique.mockResolvedValue({
        id: 'track-1',
        title: 'A Song',
        deletedAt: null,
      } as never)
      const sibling = { ...REPORT, id: 'report-2' }
      prisma.moderationReport.findMany.mockResolvedValue([sibling] as never)

      const result = await service.findById('report-1')

      expect(prisma.moderationReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { entityType: 'track', entityId: 'track-1', id: { not: 'report-1' } },
          take: 20,
        }),
      )
      expect(result.siblingReports).toEqual([sibling])
    })
  })

  describe('updateStatus', () => {
    it('throws ReportNotFoundException when the report does not exist', async () => {
      prisma.moderationReport.findFirst.mockResolvedValue(null)

      await expect(service.updateStatus('missing', { status: 'RESOLVED' })).rejects.toThrow(
        ReportNotFoundException,
      )
    })

    it('sets resolvedAt when moving to a terminal status', async () => {
      prisma.moderationReport.findFirst.mockResolvedValue(REPORT as never)
      prisma.moderationReport.update.mockResolvedValue({
        ...REPORT,
        status: 'RESOLVED',
        resolvedAt: new Date(),
      } as never)

      await service.updateStatus('report-1', { status: 'RESOLVED' })

      expect(prisma.moderationReport.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'report-1' },
          data: expect.objectContaining({ status: 'RESOLVED' }),
        }),
      )
      const call = prisma.moderationReport.update.mock.calls[0]?.[0]
      expect(call?.data.resolvedAt).toBeInstanceOf(Date)
    })

    it('clears resolvedAt when moving back to a non-terminal status', async () => {
      prisma.moderationReport.findFirst.mockResolvedValue({
        ...REPORT,
        status: 'RESOLVED',
        resolvedAt: new Date(),
      } as never)
      prisma.moderationReport.update.mockResolvedValue(REPORT as never)

      await service.updateStatus('report-1', { status: 'REVIEWING' })

      const call = prisma.moderationReport.update.mock.calls[0]?.[0]
      expect(call?.data.resolvedAt).toBeNull()
    })
  })
})
