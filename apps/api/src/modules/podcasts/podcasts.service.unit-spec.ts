import { beforeEach, describe, expect, it } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { PodcastsService } from './podcasts.service'

describe('PodcastsService', () => {
  let prisma: PrismaMock
  let service: PodcastsService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new PodcastsService(prisma)
  })

  describe('getById', () => {
    it('throws NotFoundException for a missing podcast without querying its episodes', async () => {
      prisma.podcast.findFirst.mockResolvedValue(null)

      await expect(service.getById('missing-podcast')).rejects.toThrow(NotFoundException)
      expect(prisma.episode.findMany).not.toHaveBeenCalled()
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })

    it('throws NotFoundException for a soft-deleted podcast the same way as a missing one', async () => {
      prisma.podcast.findFirst.mockResolvedValue(null)

      await expect(service.getById('deleted-podcast')).rejects.toThrow(NotFoundException)
      expect(prisma.podcast.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'deleted-podcast', deletedAt: null } }),
      )
    })

    it('pages every live episode of the podcast when no search is given', async () => {
      prisma.podcast.findFirst.mockResolvedValue({ id: 'podcast-1' } as never)
      prisma.$transaction.mockResolvedValue([[], 12] as never)

      const result = await service.getById('podcast-1', 2, 5)

      expect(prisma.episode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { podcastId: 'podcast-1', deletedAt: null },
          skip: 5,
          take: 5,
        }),
      )
      expect(prisma.episode.count).toHaveBeenCalledWith({
        where: { podcastId: 'podcast-1', deletedAt: null },
      })
      expect(result.episodes).toEqual({ data: [], total: 12, page: 2, limit: 5 })
    })

    it('narrows episodes and their total to a case-insensitive title or description search', async () => {
      const episodes = [{ id: 'episode-1' }]
      prisma.podcast.findFirst.mockResolvedValue({ id: 'podcast-1' } as never)
      prisma.$transaction.mockResolvedValue([episodes, 1] as never)
      const where: Prisma.EpisodeWhereInput = {
        podcastId: 'podcast-1',
        deletedAt: null,
        OR: [
          { title: { contains: 'mixing', mode: 'insensitive' } },
          { description: { contains: 'mixing', mode: 'insensitive' } },
        ],
      }

      const result = await service.getById('podcast-1', 1, 20, 'mixing')

      expect(prisma.episode.findMany).toHaveBeenCalledWith(expect.objectContaining({ where }))
      expect(prisma.episode.count).toHaveBeenCalledWith({ where })
      expect(result.episodes).toEqual({ data: episodes, total: 1, page: 1, limit: 20 })
    })

    it('treats an empty search as no search', async () => {
      prisma.podcast.findFirst.mockResolvedValue({ id: 'podcast-1' } as never)
      prisma.$transaction.mockResolvedValue([[], 0] as never)

      await service.getById('podcast-1', 1, 20, '')

      expect(prisma.episode.count).toHaveBeenCalledWith({
        where: { podcastId: 'podcast-1', deletedAt: null },
      })
    })
  })

  describe('saveEpisode', () => {
    it('throws NotFoundException for a missing episode without touching UserSavedEpisode', async () => {
      prisma.episode.findFirst.mockResolvedValue(null)

      await expect(service.saveEpisode('user-1', 'missing-episode')).rejects.toThrow(
        NotFoundException,
      )
      expect(prisma.userSavedEpisode.upsert).not.toHaveBeenCalled()
    })
  })
})
