import { Readable } from 'node:stream'
import type { CacheService } from '@infra/cache/cache.service'
import type { StorageService } from '@infra/storage/storage.types'
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

const makeCacheMock = () =>
  ({
    get: jest.fn().mockResolvedValue(null as never),
    set: jest.fn().mockResolvedValue(undefined as never),
    del: jest.fn().mockResolvedValue(undefined as never),
    invalidate: jest.fn().mockResolvedValue(undefined as never),
    wrap: jest.fn().mockImplementation((...args: unknown[]) => (args[3] as () => unknown)()),
  }) as unknown as CacheService

const makeStorageMock = () =>
  ({
    exists: jest.fn().mockResolvedValue(true as never),
    getObjectStream: jest.fn().mockResolvedValue({
      stream: { pipe: jest.fn() },
      contentLength: 2048,
      contentType: 'audio/ogg',
    } as never),
    getPresignedUrl: jest.fn(),
  }) as unknown as jest.Mocked<StorageService>

jest.mock(
  'music-metadata',
  () => ({
    parseFile: jest.fn().mockResolvedValue({
      format: { duration: 100, bitrate: 128000 },
    } as never),
  }),
  { virtual: true },
)

jest.mock('node:fs', () => ({
  createReadStream: jest.fn().mockReturnValue({ pipe: jest.fn() }),
  promises: {
    stat: jest.fn().mockResolvedValue({ size: 1024 * 1024 } as never),
    access: jest.fn().mockResolvedValue(undefined as never),
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
  let storage: jest.Mocked<StorageService>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    queue = makeQueueMock()
    config = makeConfigMock()
    storage = makeStorageMock()
    service = new TracksService(prisma, queue, config, makeCacheMock(), storage)
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

      const calls = (prisma.$transaction as jest.Mock).mock.calls[0]
      expect(calls).toBeDefined()
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

  describe('getTrackAudioStream', () => {
    it('should choose the highest preferred format bitrate not exceeding the request', async () => {
      prisma.track.findFirst.mockResolvedValue(buildTrack() as never)
      prisma.trackFile.findMany.mockResolvedValue([
        { bitrate: 128, format: 'opus', url: 'track_128.opus', codec: 'opus' },
        { bitrate: 192, format: 'opus', url: 'track_192.opus', codec: 'opus' },
        { bitrate: 320, format: 'opus', url: 'track_320.opus', codec: 'opus' },
      ] as never)

      const result = await service.getTrackAudioStream('track-1', 256)

      expect(result.bitrate).toBe(192)
      expect(result.format).toBe('opus')
      expect(result.contentType).toBe('audio/ogg')
      expect(storage.getObjectStream).toHaveBeenCalledWith('track_192.opus')
    })
  })

  describe('getTrackStream', () => {
    it('should throw NotFoundException when track not in DB', async () => {
      prisma.track.findUnique.mockResolvedValue(null)

      await expect(service.getTrackStream('nonexistent')).rejects.toThrow(NotFoundException)
    })

    it('should return the requested byte range without a ten-second cap', async () => {
      prisma.track.findFirst.mockResolvedValue(buildTrack() as never)
      prisma.trackFile.findMany.mockResolvedValue([
        { bitrate: 192, format: 'opus', url: 'track_192.opus', codec: 'opus' },
      ] as never)

      const result = await service.getTrackStream('track-1', 'bytes=100-999', 192)

      expect(result).toEqual(
        expect.objectContaining({
          start: 100,
          end: 999,
          contentLength: 900,
          isPartial: true,
          bitrate: 192,
        }),
      )
      expect(storage.getObjectStream).toHaveBeenLastCalledWith('track_192.opus', 'bytes=100-999')
    })
  })

  describe('getHlsMasterPlaylist', () => {
    it('should return the generated HLS master playlist', async () => {
      prisma.track.findUnique.mockResolvedValue(buildTrack() as never)
      storage.getObjectStream.mockResolvedValue({
        stream: Readable.from('#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=140800\n128/index.m3u8\n'),
      } as never)

      const playlist = await service.getHlsMasterPlaylist('track-1')

      expect(playlist).toContain('128/index.m3u8')
      expect(storage.getObjectStream).toHaveBeenCalledWith('tracks/track-1/hls/master.m3u8')
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
      expect(prisma.trackFile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ bitrate: 128 }),
        }),
      )
      expect(queue.add).toHaveBeenCalledWith(
        'convert-audio',
        expect.objectContaining({
          bitrates: ['128k'],
          sourceFileName: audioFile.filename,
        }),
        expect.objectContaining({
          attempts: 5,
          backoff: { type: 'exponential', delay: 5_000 },
          jobId: expect.stringContaining(audioFile.filename),
        }),
      )
      expect(result).toBe(track)
    })

    it('should mark the track failed when the queue cannot accept the job', async () => {
      const track = buildTrack()
      const audioFile = buildAudioFile()
      mockTransaction(prisma)
      prisma.track.create.mockResolvedValue(track as never)
      prisma.trackFile.create.mockResolvedValue({ id: 'tf-1' } as never)
      prisma.track.update.mockResolvedValue(track as never)
      queue.add.mockRejectedValue(new Error('Redis unavailable') as never)

      await expect(
        service.create('artist-1', { title: 'Track title' } as CreateTrackDto, audioFile),
      ).rejects.toThrow('Redis unavailable')

      expect(prisma.track.update).toHaveBeenCalledWith({
        where: { id: track.id },
        data: expect.objectContaining({
          processingStatus: 'FAILED',
          processingError: 'Redis unavailable',
        }),
      })
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

      prisma.track.findFirst.mockResolvedValue(track as never)

      const result = await service.update(
        'artist-1',
        'track-1',
        { title: 'Updated' } as CreateTrackDto,
        audioFile,
      )

      expect(prisma.track.update).toHaveBeenCalled()
      expect(queue.add).toHaveBeenCalledWith(
        'convert-audio',
        expect.objectContaining({ sourceFileName: audioFile.filename }),
        expect.objectContaining({ attempts: 5 }),
      )
      expect(result).toBe(track)
    })

    it('should update track without queue when no audio file', async () => {
      const track = buildTrack()
      mockTransaction(prisma)
      prisma.track.update.mockResolvedValue(track as never)

      prisma.track.findFirst.mockResolvedValue(track as never)

      await service.update('artist-1', 'track-1', { title: 'Updated' } as never)

      expect(queue.add).not.toHaveBeenCalled()
    })
  })
})
