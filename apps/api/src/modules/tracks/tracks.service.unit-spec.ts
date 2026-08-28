import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { makeCacheMock, type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildTrack } from './__tests__/fixtures/tracks.fixtures'
import { TracksService } from './tracks.service'

describe('TracksService', () => {
  let service: TracksService
  let prisma: PrismaMock

  beforeEach(() => {
    jest.clearAllMocks()
    resetPrismaMock()
    prisma = prismaMock
    service = new TracksService(prisma, makeCacheMock())
  })

  describe('findAll', () => {
    it('should return paginated tracks', async () => {
      const tracks = [buildTrack()]
      prisma.$transaction.mockResolvedValue([tracks, 1] as never)

      const result = await service.findAll({ page: 1, limit: 10 })

      expect(prisma.$transaction).toHaveBeenCalled()
      expect(result).toEqual({ data: tracks, total: 1, page: 1, limit: 10 })
    })

    it('should filter by title when provided', async () => {
      prisma.$transaction.mockResolvedValue([[], 0] as never)

      await service.findAll({ title: 'test' })

      expect(prisma.track.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: { contains: 'test', mode: 'insensitive' },
          }),
        }),
      )
    })
  })

  describe('findLikedTracks', () => {
    it('should query tracks liked by user', async () => {
      const track = buildTrack()
      const likedAt = new Date()
      prisma.$transaction.mockResolvedValue([[{ track, createdAt: likedAt }], 1] as never)

      const result = await service.findLikedTracks('user-1', { page: 1, limit: 10 })

      expect(prisma.userLikedTrack.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          track: { processingStatus: 'READY', deletedAt: null },
        },
        include: { track: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      })
      expect(result).toEqual({
        data: [{ ...track, likedAt }],
        total: 1,
        page: 1,
        limit: 10,
      })
    })
  })

  describe('findTrackById', () => {
    it('should return track by id', async () => {
      const track = buildTrack()
      prisma.track.findFirst.mockResolvedValue(track as never)

      const result = await service.findTrackById('track-1')

      expect(prisma.track.findFirst).toHaveBeenCalledWith({
        where: { id: 'track-1', processingStatus: 'READY', deletedAt: null },
      })
      expect(result).toBe(track)
    })
  })

  describe('findTracksByArtistId', () => {
    it('should return tracks by artistId', async () => {
      const tracks = [buildTrack()]
      prisma.track.findMany.mockResolvedValue(tracks as never)

      const result = await service.findTracksByArtistId('artist-1')

      expect(prisma.track.findMany).toHaveBeenCalledWith({
        where: { artistId: 'artist-1', processingStatus: 'READY', deletedAt: null },
      })
      expect(result).toBe(tracks)
    })
  })

  describe('findTracksByArtistName', () => {
    it('should return tracks by artist username', async () => {
      const tracks = [buildTrack()]
      prisma.track.findMany.mockResolvedValue(tracks as never)

      const result = await service.findTracksByArtistName('artist')

      expect(prisma.track.findMany).toHaveBeenCalledWith({
        where: {
          processingStatus: 'READY',
          deletedAt: null,
          artist: { username: 'artist' },
        },
      })
      expect(result).toBe(tracks)
    })
  })
})
