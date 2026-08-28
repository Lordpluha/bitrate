import { Readable } from 'node:stream'
import type { StorageService } from '@infra/storage/storage.types'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import { makeStorageMock, type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildTrack } from './__tests__/fixtures/tracks.fixtures'
import { TrackStreamingService } from './track-streaming.service'

describe('TrackStreamingService', () => {
  let service: TrackStreamingService
  let prisma: PrismaMock
  let storage: jest.Mocked<StorageService>

  beforeEach(() => {
    jest.clearAllMocks()
    resetPrismaMock()
    prisma = prismaMock
    storage = makeStorageMock()
    service = new TrackStreamingService(prisma, storage)
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
      prisma.track.findFirst.mockResolvedValue(null)

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
      prisma.track.findFirst.mockResolvedValue({
        ...buildTrack(),
        audioFiles: [{ url: 'tracks/track-1/audio/128k.opus' }],
      } as never)
      storage.getObjectStream.mockResolvedValue({
        stream: Readable.from('#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=140800\n128/index.m3u8\n'),
      } as never)

      const playlist = await service.getHlsMasterPlaylist('track-1')

      expect(playlist).toContain('128/index.m3u8')
      expect(storage.getObjectStream).toHaveBeenCalledWith('tracks/track-1/hls/master.m3u8')
      expect(prisma.track.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'track-1', deletedAt: null } }),
      )
    })

    it('reads HLS from the immutable generation associated with the published audio row', async () => {
      prisma.track.findFirst.mockResolvedValue({
        ...buildTrack(),
        audioFiles: [{ url: 'tracks/track-1/generations/0123456789abcdef/audio/128k.opus' }],
      } as never)
      storage.getObjectStream.mockResolvedValue({ stream: Readable.from('#EXTM3U\n') } as never)

      await service.getHlsMasterPlaylist('track-1')

      expect(storage.getObjectStream).toHaveBeenCalledWith(
        'tracks/track-1/generations/0123456789abcdef/hls/master.m3u8',
      )
    })

    it('should 404 a soft-deleted track instead of serving the playlist', async () => {
      prisma.track.findFirst.mockResolvedValue(null)

      await expect(service.getHlsMasterPlaylist('track-1')).rejects.toThrow(NotFoundException)
      expect(storage.getObjectStream).not.toHaveBeenCalled()
    })
  })

  describe('getHlsAsset', () => {
    it('rejects an asset name outside the allowed HLS artifact set', async () => {
      await expect(service.getHlsAsset('track-1', 128, '../../secret')).rejects.toThrow(
        NotFoundException,
      )
      expect(prisma.track.findFirst).not.toHaveBeenCalled()
      expect(prisma.trackFile.findUnique).not.toHaveBeenCalled()
    })

    it('should 404 a soft-deleted track instead of proxying the asset', async () => {
      prisma.track.findFirst.mockResolvedValue(null)

      await expect(service.getHlsAsset('track-1', 128, 'index.m3u8')).rejects.toThrow(
        NotFoundException,
      )
      expect(prisma.trackFile.findUnique).not.toHaveBeenCalled()
    })

    it('should 404 a track that is not READY yet', async () => {
      prisma.track.findFirst.mockResolvedValue({
        ...buildTrack(),
        processingStatus: 'PROCESSING',
      } as never)

      await expect(service.getHlsAsset('track-1', 128, 'index.m3u8')).rejects.toThrow(
        NotFoundException,
      )
      expect(prisma.trackFile.findUnique).not.toHaveBeenCalled()
    })

    it('proxies the asset for a READY, non-deleted track', async () => {
      prisma.track.findFirst.mockResolvedValue(buildTrack() as never)
      prisma.trackFile.findUnique.mockResolvedValue({
        url: 'tracks/track-1/generations/abc/audio/128k.opus',
      } as never)
      storage.getObjectStream.mockResolvedValue({
        stream: Readable.from('segment'),
        contentLength: 7,
      } as never)

      const asset = await service.getHlsAsset('track-1', 128, 'index.m3u8')

      expect(asset.contentLength).toBe(7)
      expect(prisma.track.findFirst).toHaveBeenCalledWith({
        where: { id: 'track-1', deletedAt: null },
      })
    })
  })
})
