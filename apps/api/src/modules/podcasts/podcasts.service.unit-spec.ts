import { beforeEach, describe, expect, it } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
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
