import type { PrismaService } from '@infra/prisma/prisma.service'
import type { StorageService } from '@infra/storage/storage.types'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { UnsatisfiableRangeError } from '@modules/tracks'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'

/** `AdminTrackAudioService` pulls in `music-metadata` via the `@modules/tracks` barrel
 * (`track-upload.service` -> `track-media.ts`); that package cannot be resolved under
 * Jest, so every spec that reaches it mocks it virtually. */
jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

import { AdminTrackAudioService } from './admin-track-audio.service'
import { TrackAudioNotAvailableException, TrackNotFoundException } from './errors'

describe('AdminTrackAudioService', () => {
  let prisma: DeepMockProxy<PrismaService>
  let storage: DeepMockProxy<StorageService>
  let service: AdminTrackAudioService

  const trackId = '00000000-0000-0000-0000-000000000001'
  const readyTrack = { processingStatus: 'READY' as const }
  const file192 = { url: 'tracks/x/cmaf/192.m4a', size: 1_456_523, bitrate: 192 }
  const file320 = { url: 'tracks/x/cmaf/320.m4a', size: 2_101_902, bitrate: 320 }

  beforeEach(() => {
    prisma = mockDeep<PrismaService>()
    storage = mockDeep<StorageService>()
    service = new AdminTrackAudioService(prisma, storage)

    storage.getObjectStream.mockResolvedValue({
      stream: {} as never,
      contentType: 'audio/mp4',
    } as never)
  })

  describe('stream', () => {
    it('reports a missing track without touching the trackFile table', async () => {
      prisma.track.findFirst.mockResolvedValue(null as never)

      await expect(service.stream(trackId, undefined)).rejects.toThrow(TrackNotFoundException)
      expect(prisma.trackFile.findFirst).not.toHaveBeenCalled()
    })

    it('defaults to the highest-bitrate CMAF rendition when no bitrate is requested', async () => {
      prisma.track.findFirst.mockResolvedValue(readyTrack as never)
      prisma.trackFile.findFirst.mockResolvedValue(file320 as never)

      const result = await service.stream(trackId, undefined)

      expect(prisma.trackFile.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            trackId,
            format: 'cmaf',
            track: { processingStatus: 'READY', playbackVersion: 2 },
          }),
          orderBy: { bitrate: 'desc' },
        }),
      )
      expect(result.bitrate).toBe(320)
    })

    it('honors an explicit bitrate', async () => {
      prisma.track.findFirst.mockResolvedValue(readyTrack as never)
      prisma.trackFile.findFirst.mockResolvedValue(file192 as never)

      await service.stream(trackId, 192)

      expect(prisma.trackFile.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ bitrate: 192 }) }),
      )
    })

    it('resolves a taken-down READY track — playback stays available for review', async () => {
      prisma.track.findFirst.mockResolvedValue(readyTrack as never)
      prisma.trackFile.findFirst.mockResolvedValue(file192 as never)

      await service.stream(trackId, 192)

      const call = prisma.trackFile.findFirst.mock.calls[0]?.[0]
      expect(call?.where).not.toHaveProperty('deletedAt')
      expect((call?.where as { trackId?: unknown })?.trackId).toBe(trackId)
    })

    it('reports audio not available when the track is not READY', async () => {
      prisma.track.findFirst.mockResolvedValue({ processingStatus: 'PROCESSING' } as never)
      prisma.trackFile.findFirst.mockResolvedValue(null as never)

      await expect(service.stream(trackId, undefined)).rejects.toThrow(
        TrackAudioNotAvailableException,
      )
    })

    it('reports audio not available when no CMAF rendition exists', async () => {
      prisma.track.findFirst.mockResolvedValue(readyTrack as never)
      prisma.trackFile.findFirst.mockResolvedValue(null as never)

      await expect(service.stream(trackId, undefined)).rejects.toThrow(
        TrackAudioNotAvailableException,
      )
    })

    it('passes a partial range to storage', async () => {
      prisma.track.findFirst.mockResolvedValue(readyTrack as never)
      prisma.trackFile.findFirst.mockResolvedValue(file192 as never)

      const result = await service.stream(trackId, 192, 'bytes=0-1023')

      expect(storage.getObjectStream).toHaveBeenCalledWith(file192.url, 'bytes=0-1023')
      expect(result.isPartial).toBe(true)
      expect(result.contentLength).toBe(1024)
    })

    it('throws UnsatisfiableRangeError for an out-of-bounds range', async () => {
      prisma.track.findFirst.mockResolvedValue(readyTrack as never)
      prisma.trackFile.findFirst.mockResolvedValue(file192 as never)

      await expect(service.stream(trackId, 192, `bytes=${file192.size + 1}-`)).rejects.toThrow(
        UnsatisfiableRangeError,
      )
      expect(storage.getObjectStream).not.toHaveBeenCalled()
    })
  })

  describe('head', () => {
    it('returns rendition metadata without opening a storage stream', async () => {
      prisma.track.findFirst.mockResolvedValue(readyTrack as never)
      prisma.trackFile.findFirst.mockResolvedValue(file320 as never)

      const meta = await service.head(trackId, undefined)

      expect(meta).toEqual({ fileSize: file320.size, contentType: 'audio/mp4', bitrate: 320 })
      expect(storage.getObjectStream).not.toHaveBeenCalled()
    })

    it('reports a missing track', async () => {
      prisma.track.findFirst.mockResolvedValue(null as never)

      await expect(service.head(trackId)).rejects.toThrow(TrackNotFoundException)
    })
  })
})
