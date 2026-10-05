import { beforeEach, describe, expect, it } from '@jest/globals'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  buildEpisode,
  buildPodcast,
  buildPodcastWithCount,
} from './__tests__/fixtures/admin-podcasts.fixtures'
import { AdminPodcastsService } from './admin-podcasts.service'
import {
  EpisodeAlreadyDeletedException,
  EpisodeNotDeletedException,
  EpisodeNotFoundException,
  PodcastAlreadyDeletedException,
  PodcastNotDeletedException,
  PodcastNotFoundException,
} from './errors'

const STAFF_ID = 'staff-1'
const DELETED_AT = new Date('2026-02-01T00:00:00Z')

describe('AdminPodcastsService', () => {
  let service: AdminPodcastsService
  let prisma: PrismaMock
  let transaction: DeepMockProxy<Prisma.TransactionClient>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    transaction = mockDeep<Prisma.TransactionClient>()
    prisma.$transaction.mockImplementation((callback: unknown) =>
      (callback as (client: Prisma.TransactionClient) => unknown)(transaction),
    )
    service = new AdminPodcastsService(prisma)
  })

  describe('findAll', () => {
    it('returns a flattened page filtered by q', async () => {
      prisma.podcast.findMany.mockResolvedValue([buildPodcastWithCount()] as never)
      prisma.podcast.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 2, limit: 5, q: 'signal' })

      expect(result).toMatchObject({ total: 1, page: 2, limit: 5 })
      expect(result.data[0]).toMatchObject({ id: 'podcast-1', episodeCount: 3 })
      expect(result.data[0]).not.toHaveProperty('_count')
      expect(prisma.podcast.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            title: { contains: 'signal', mode: 'insensitive' },
          }),
          skip: 5,
          take: 5,
        }),
      )
    })

    it('excludes taken-down podcasts by default', async () => {
      prisma.podcast.findMany.mockResolvedValue([] as never)
      prisma.podcast.count.mockResolvedValue(0)

      await service.findAll({})

      expect(prisma.podcast.findMany.mock.calls[0]?.[0]?.where).toMatchObject({ deletedAt: null })
    })

    it('status=deactivated lists only taken-down podcasts', async () => {
      prisma.podcast.findMany.mockResolvedValue([] as never)
      prisma.podcast.count.mockResolvedValue(0)

      await service.findAll({ status: 'deactivated' })

      expect(prisma.podcast.findMany.mock.calls[0]?.[0]?.where).toMatchObject({
        deletedAt: { not: null },
      })
    })

    it('status=all drops the deletedAt filter', async () => {
      prisma.podcast.findMany.mockResolvedValue([] as never)
      prisma.podcast.count.mockResolvedValue(0)

      await service.findAll({ status: 'all' })

      expect(prisma.podcast.findMany.mock.calls[0]?.[0]?.where).not.toHaveProperty('deletedAt')
    })

    it('orders by createdAt desc with an id tie-break when no sort is given', async () => {
      prisma.podcast.findMany.mockResolvedValue([] as never)
      prisma.podcast.count.mockResolvedValue(0)

      await service.findAll({})

      expect(prisma.podcast.findMany.mock.calls[0]?.[0]?.orderBy).toEqual([
        { createdAt: 'desc' },
        { id: 'desc' },
      ])
    })

    it('orders by the chosen field with a matching-direction id tie-break', async () => {
      prisma.podcast.findMany.mockResolvedValue([] as never)
      prisma.podcast.count.mockResolvedValue(0)

      await service.findAll({ sort: 'title', order: 'asc' })

      expect(prisma.podcast.findMany.mock.calls[0]?.[0]?.orderBy).toEqual([
        { title: 'asc' },
        { id: 'asc' },
      ])
    })
  })

  describe('findById', () => {
    it('throws PodcastNotFoundException when the podcast does not exist', async () => {
      prisma.podcast.findFirst.mockResolvedValue(null)

      await expect(service.findById('missing')).rejects.toThrow(PodcastNotFoundException)
    })

    it('returns a taken-down podcast with each episode carrying its own deletedAt', async () => {
      prisma.podcast.findFirst.mockResolvedValue({
        ...buildPodcastWithCount({ deletedAt: DELETED_AT }),
        episodes: [
          buildEpisode({ id: 'episode-1' }),
          buildEpisode({ id: 'episode-2', deletedAt: DELETED_AT }),
        ],
      } as never)

      const result = await service.findById('podcast-1')

      expect(result.deletedAt).toEqual(DELETED_AT)
      expect(result.episodes.map((episode) => [episode.id, episode.deletedAt])).toEqual([
        ['episode-1', null],
        ['episode-2', DELETED_AT],
      ])
    })

    it('does not filter by deletedAt, on the podcast or its episodes', async () => {
      prisma.podcast.findFirst.mockResolvedValue({
        ...buildPodcastWithCount(),
        episodes: [],
      } as never)

      await service.findById('podcast-1')

      const call = prisma.podcast.findFirst.mock.calls[0]?.[0]
      expect(call?.where).toEqual({ id: 'podcast-1' })
      expect(call?.select).toMatchObject({
        episodes: expect.not.objectContaining({ where: expect.anything() }),
      })
    })
  })

  describe('softDelete', () => {
    it('throws PodcastNotFoundException when the podcast does not exist', async () => {
      prisma.podcast.findFirst.mockResolvedValue(null)

      await expect(service.softDelete('missing', STAFF_ID)).rejects.toThrow(
        PodcastNotFoundException,
      )
    })

    it('throws PodcastAlreadyDeletedException when already taken down', async () => {
      prisma.podcast.findFirst.mockResolvedValue(buildPodcast({ deletedAt: DELETED_AT }) as never)

      await expect(service.softDelete('podcast-1', STAFF_ID)).rejects.toThrow(
        PodcastAlreadyDeletedException,
      )
    })

    it('throws PodcastAlreadyDeletedException when a concurrent request wins the race', async () => {
      prisma.podcast.findFirst.mockResolvedValue(buildPodcast() as never)
      transaction.podcast.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.softDelete('podcast-1', STAFF_ID)).rejects.toThrow(
        PodcastAlreadyDeletedException,
      )
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    /** AC2: the podcast take-down is independent of episode-level state. */
    it('stamps only the podcast, audits it, and never touches its episodes', async () => {
      prisma.podcast.findFirst.mockResolvedValue(buildPodcast() as never)
      transaction.podcast.updateMany.mockResolvedValue({ count: 1 })
      transaction.podcast.findFirstOrThrow.mockResolvedValue(
        buildPodcastWithCount({ deletedAt: new Date() }) as never,
      )

      const result = await service.softDelete('podcast-1', STAFF_ID, 'rights claim')

      expect(transaction.podcast.updateMany).toHaveBeenCalledWith({
        where: { id: 'podcast-1', deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      })
      expect(transaction.episode.updateMany).not.toHaveBeenCalled()
      expect(transaction.episode.update).not.toHaveBeenCalled()
      expect(result.deletedAt).toBeInstanceOf(Date)
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'admin-podcasts.delete',
            entityType: 'admin-podcasts',
            entityId: 'podcast-1',
            metadata: expect.objectContaining({ reason: 'rights claim' }),
          }),
        }),
      )
    })
  })

  describe('restore', () => {
    it('throws PodcastNotFoundException when the podcast does not exist', async () => {
      prisma.podcast.findFirst.mockResolvedValue(null)

      await expect(service.restore('missing', STAFF_ID)).rejects.toThrow(PodcastNotFoundException)
    })

    it('throws PodcastNotDeletedException when the podcast is not taken down', async () => {
      prisma.podcast.findFirst.mockResolvedValue(buildPodcast() as never)

      await expect(service.restore('podcast-1', STAFF_ID)).rejects.toThrow(
        PodcastNotDeletedException,
      )
    })

    it('throws PodcastNotDeletedException when a concurrent request wins the race', async () => {
      prisma.podcast.findFirst.mockResolvedValue(buildPodcast({ deletedAt: DELETED_AT }) as never)
      transaction.podcast.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.restore('podcast-1', STAFF_ID)).rejects.toThrow(
        PodcastNotDeletedException,
      )
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    it('clears only the podcast deletedAt, audits it, and leaves episodes alone', async () => {
      prisma.podcast.findFirst.mockResolvedValue(buildPodcast({ deletedAt: DELETED_AT }) as never)
      transaction.podcast.updateMany.mockResolvedValue({ count: 1 })
      transaction.podcast.findFirstOrThrow.mockResolvedValue(buildPodcastWithCount() as never)

      const result = await service.restore('podcast-1', STAFF_ID)

      expect(transaction.podcast.updateMany).toHaveBeenCalledWith({
        where: { id: 'podcast-1', deletedAt: { not: null } },
        data: { deletedAt: null },
      })
      expect(transaction.episode.updateMany).not.toHaveBeenCalled()
      expect(result.deletedAt).toBeNull()
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'admin-podcasts.restore' }),
        }),
      )
    })
  })

  describe('softDeleteEpisode', () => {
    it('throws EpisodeNotFoundException when the episode does not belong to the podcast', async () => {
      prisma.episode.findFirst.mockResolvedValue(null)

      await expect(service.softDeleteEpisode('podcast-2', 'episode-1', STAFF_ID)).rejects.toThrow(
        EpisodeNotFoundException,
      )
      expect(prisma.episode.findFirst).toHaveBeenCalledWith({
        where: { id: 'episode-1', podcastId: 'podcast-2' },
      })
    })

    it('throws EpisodeAlreadyDeletedException when already taken down', async () => {
      prisma.episode.findFirst.mockResolvedValue(buildEpisode({ deletedAt: DELETED_AT }) as never)

      await expect(service.softDeleteEpisode('podcast-1', 'episode-1', STAFF_ID)).rejects.toThrow(
        EpisodeAlreadyDeletedException,
      )
    })

    it('throws EpisodeAlreadyDeletedException when a concurrent request wins the race', async () => {
      prisma.episode.findFirst.mockResolvedValue(buildEpisode() as never)
      transaction.episode.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.softDeleteEpisode('podcast-1', 'episode-1', STAFF_ID)).rejects.toThrow(
        EpisodeAlreadyDeletedException,
      )
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    /** AC1: one episode's take-down never touches the podcast or its sibling episodes. */
    it('stamps only that episode, audits it, and never touches the podcast or siblings', async () => {
      prisma.episode.findFirst.mockResolvedValue(buildEpisode() as never)
      transaction.episode.updateMany.mockResolvedValue({ count: 1 })
      transaction.episode.findFirstOrThrow.mockResolvedValue(
        buildEpisode({ deletedAt: new Date() }) as never,
      )

      const result = await service.softDeleteEpisode('podcast-1', 'episode-1', STAFF_ID, 'dmca')

      expect(transaction.episode.updateMany).toHaveBeenCalledTimes(1)
      expect(transaction.episode.updateMany).toHaveBeenCalledWith({
        where: { id: 'episode-1', podcastId: 'podcast-1', deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      })
      expect(transaction.podcast.updateMany).not.toHaveBeenCalled()
      expect(transaction.podcast.update).not.toHaveBeenCalled()
      expect(result.deletedAt).toBeInstanceOf(Date)
      expect(result).not.toHaveProperty('audioUrl')
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'admin-podcast-episodes.delete',
            entityType: 'admin-podcast-episodes',
            entityId: 'episode-1',
            metadata: expect.objectContaining({ reason: 'dmca' }),
          }),
        }),
      )
    })
  })

  describe('restoreEpisode', () => {
    it('throws EpisodeNotFoundException when the episode does not belong to the podcast', async () => {
      prisma.episode.findFirst.mockResolvedValue(null)

      await expect(service.restoreEpisode('podcast-2', 'episode-1', STAFF_ID)).rejects.toThrow(
        EpisodeNotFoundException,
      )
    })

    it('throws EpisodeNotDeletedException when the episode is not taken down', async () => {
      prisma.episode.findFirst.mockResolvedValue(buildEpisode() as never)

      await expect(service.restoreEpisode('podcast-1', 'episode-1', STAFF_ID)).rejects.toThrow(
        EpisodeNotDeletedException,
      )
    })

    it('throws EpisodeNotDeletedException when a concurrent request wins the race', async () => {
      prisma.episode.findFirst.mockResolvedValue(buildEpisode({ deletedAt: DELETED_AT }) as never)
      transaction.episode.updateMany.mockResolvedValue({ count: 0 })

      await expect(service.restoreEpisode('podcast-1', 'episode-1', STAFF_ID)).rejects.toThrow(
        EpisodeNotDeletedException,
      )
      expect(transaction.auditLog.create).not.toHaveBeenCalled()
    })

    it('clears only that episode and audits it', async () => {
      prisma.episode.findFirst.mockResolvedValue(buildEpisode({ deletedAt: DELETED_AT }) as never)
      transaction.episode.updateMany.mockResolvedValue({ count: 1 })
      transaction.episode.findFirstOrThrow.mockResolvedValue(buildEpisode() as never)

      const result = await service.restoreEpisode('podcast-1', 'episode-1', STAFF_ID)

      expect(transaction.episode.updateMany).toHaveBeenCalledWith({
        where: { id: 'episode-1', podcastId: 'podcast-1', deletedAt: { not: null } },
        data: { deletedAt: null },
      })
      expect(transaction.podcast.updateMany).not.toHaveBeenCalled()
      expect(result.deletedAt).toBeNull()
      expect(transaction.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'admin-podcast-episodes.restore' }),
        }),
      )
    })
  })
})
