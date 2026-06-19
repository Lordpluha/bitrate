import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import type { Queue } from 'bullmq'
import { buildAudioFile, buildTrack } from './__tests__/fixtures/tracks.fixtures'
import type { CreateTrackDto } from './dtos/create-track.dto'
import { TracksService } from './tracks.service'

const makeQueueMock = () =>
  ({
    add: jest.fn(),
  }) as unknown as jest.Mocked<Queue>

const makeConfigMock = () =>
  ({
    getOrThrow: jest.fn().mockReturnValue({
      getTracksDir: (filename?: string) => (filename ? `/storage/${filename}` : '/storage'),
    }),
  }) as unknown as jest.Mocked<ConfigService>

jest.mock('music-metadata', () => ({
  parseFile: jest.fn().mockResolvedValue({
    format: { duration: 100, bitrate: 128000 },
  } as never),
}))

jest.mock('node:fs', () => ({
  createReadStream: jest.fn().mockReturnValue({ pipe: jest.fn() }),
  promises: {
    stat: jest.fn().mockResolvedValue({ size: 1024 * 1024 } as never),
  },
}))

const mockTransaction = (prisma: PrismaMock) =>
  prisma.$transaction.mockImplementation((fn: unknown) => {
    if (typeof fn === 'function') return (fn as (p: typeof prisma) => unknown)(prisma)
  })

describe('TracksService', () => {
  let service: TracksService
  let prisma: PrismaMock
  let queue: jest.Mocked<Queue>
  let config: jest.Mocked<ConfigService>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    queue = makeQueueMock()
    config = makeConfigMock()
    service = new TracksService(prisma, queue, config)
  })

  describe('findAll', () => {
    it('should return paginated tracks', async () => {
      const tracks = [buildTrack()]
      prisma.$transaction.mockResolvedValue([tracks, 1] as never)

      const result = await service.findAll({ page: 1, limit: 10 })

      expect(prisma.$transaction).toHaveBeenCalled()
      expect(result).toEqual({ data: tracks, meta: { total: 1, page: 1, limit: 10, lastPage: 1 } })
    })

    it('should filter by title when provided', async () => {
      prisma.$transaction.mockResolvedValue([[], 0] as never)

      await service.findAll({ title: 'test' })

      const calls = (prisma.$transaction as jest.Mock).mock.calls[0]
      expect(calls).toBeDefined()
    })
  })

  describe('findLikedTracks', () => {
    it('should query tracks liked by user', async () => {
      const tracks = [buildTrack()]
      prisma.track.findMany.mockResolvedValue(tracks as never)

      const result = await service.findLikedTracks('user-1', { page: 1, limit: 10 })

      expect(prisma.track.findMany).toHaveBeenCalledWith({
        where: { likedBy: { some: { id: 'user-1' } } },
        skip: 0,
        take: 10,
      })
      expect(result).toBe(tracks)
    })
  })

  describe('findTrackById', () => {
    it('should return track by id', async () => {
      const track = buildTrack()
      prisma.track.findUnique.mockResolvedValue(track as never)

      const result = await service.findTrackById('track-1')

      expect(prisma.track.findUnique).toHaveBeenCalledWith({ where: { id: 'track-1' } })
      expect(result).toBe(track)
    })
  })

  describe('getTrackStream', () => {
    it('should throw NotFoundException when track not in DB', async () => {
      prisma.track.findUnique.mockResolvedValue(null)

      await expect(service.getTrackStream('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findTracksByArtistId', () => {
    it('should return tracks by artistId', async () => {
      const tracks = [buildTrack()]
      prisma.track.findMany.mockResolvedValue(tracks as never)

      const result = await service.findTracksByArtistId('artist-1')

      expect(prisma.track.findMany).toHaveBeenCalledWith({ where: { artistId: 'artist-1' } })
      expect(result).toBe(tracks)
    })
  })

  describe('findTracksByArtistName', () => {
    it('should return tracks by artist username', async () => {
      const tracks = [buildTrack()]
      prisma.track.findMany.mockResolvedValue(tracks as never)

      const result = await service.findTracksByArtistName('artist')

      expect(prisma.track.findMany).toHaveBeenCalledWith({
        where: { artist: { username: 'artist' } },
      })
      expect(result).toBe(tracks)
    })
  })

  describe('create', () => {
    it('should create track in transaction and enqueue conversion job', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      mockTransaction(prisma)
      prisma.track.create.mockResolvedValue(track as never)
      prisma.trackFile.create.mockResolvedValue({ id: 'tf-1' } as never)
      queue.add.mockResolvedValue({} as never)

      const result = await service.create(
        'artist-1',
        { title: 'Track title' } as CreateTrackDto,
        audioFile,
      )

      expect(prisma.track.create).toHaveBeenCalled()
      expect(prisma.trackFile.create).toHaveBeenCalled()
      expect(queue.add).toHaveBeenCalledWith('convert-audio', expect.any(Object))
      expect(result).toBe(track)
    })

    it('should set cover to null when no cover file provided', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      mockTransaction(prisma)
      prisma.track.create.mockResolvedValue(track as never)
      prisma.trackFile.create.mockResolvedValue({ id: 'tf-1' } as never)
      queue.add.mockResolvedValue({} as never)

      await service.create(
        'artist-1',
        { title: 'Track title' } as CreateTrackDto,
        audioFile,
        undefined,
      )

      expect(prisma.track.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ cover: null }) }),
      )
    })
  })

  describe('update', () => {
    it('should update track and enqueue job when audio file provided', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      mockTransaction(prisma)
      prisma.track.update.mockResolvedValue(track as never)
      prisma.trackFile.upsert.mockResolvedValue({ id: 'tf-1' } as never)
      queue.add.mockResolvedValue({} as never)

      const result = await service.update(
        'track-1',
        { title: 'Updated' } as CreateTrackDto,
        audioFile,
      )

      expect(prisma.track.update).toHaveBeenCalled()
      expect(queue.add).toHaveBeenCalledWith('convert-audio', expect.any(Object))
      expect(result).toBe(track)
    })

    it('should update track without queue when no audio file', async () => {
      const track = buildTrack()
      mockTransaction(prisma)
      prisma.track.update.mockResolvedValue(track as never)

      await service.update('track-1', { title: 'Updated' } as never)

      expect(queue.add).not.toHaveBeenCalled()
    })
  })
})
