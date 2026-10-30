import { Readable } from 'node:stream'
import type { PrismaService } from '@infra/prisma/prisma.service'
import type { StorageService } from '@infra/storage/storage.types'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { ForbiddenException, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import {
  type AuthorizedPlaybackSession,
  PlaybackPacingError,
  type PlaybackSessionService,
} from './playback-session.service'
import { TrackPlaybackService } from './track-playback.service'

describe('TrackPlaybackService', () => {
  let prisma: DeepMockProxy<PrismaService>
  let storage: DeepMockProxy<StorageService>
  let sessions: DeepMockProxy<PlaybackSessionService>
  let service: TrackPlaybackService

  const trackId = '00000000-0000-0000-0000-000000000001'

  beforeEach(() => {
    prisma = mockDeep<PrismaService>()
    storage = mockDeep<StorageService>()
    sessions = mockDeep<PlaybackSessionService>()
    service = new TrackPlaybackService(prisma, storage, sessions)
  })

  describe('getManifest', () => {
    const trackWithRenditions = {
      fragmentTimescale: 48_000,
      durationTicks: 2_880_000,
      audioFiles: [
        {
          bitrate: 128,
          codec: 'mp4a.40.2',
          size: 977_980,
          initRangeStart: 0,
          initRangeEnd: 707,
          fragments: [[0, 2_880_000, 929, 66_238]],
        },
        {
          bitrate: 320,
          codec: 'mp4a.40.2',
          size: 2_101_902,
          initRangeStart: 0,
          initRangeEnd: 707,
          fragments: [[0, 2_880_000, 929, 145_762]],
        },
      ],
    }

    it('builds a manifest from the stored fragment index', async () => {
      prisma.track.findFirst.mockResolvedValue(trackWithRenditions as never)

      const manifest = await service.getManifest(trackId)

      expect(manifest).toMatchObject({
        version: 1,
        timescale: 48_000,
        durationTicks: 2_880_000,
        durationMs: 60_000,
      })
      expect(manifest.renditions.map((rendition) => rendition.bitrate)).toEqual([128, 320])
      expect(manifest.renditions[0]?.initRange).toEqual([0, 707])
    })

    it('derives duration in milliseconds from ticks and timescale', async () => {
      prisma.track.findFirst.mockResolvedValue({
        ...trackWithRenditions,
        durationTicks: 195_584,
        audioFiles: trackWithRenditions.audioFiles.map((file) => ({
          ...file,
          fragments: [[0, 195_584, file.fragments[0]?.[2], file.fragments[0]?.[3]]],
        })),
      } as never)

      const manifest = await service.getManifest(trackId)

      expect(manifest.durationMs).toBe(4_075)
    })

    it('reports a missing track', async () => {
      prisma.track.findFirst.mockResolvedValue(null as never)

      await expect(service.getManifest(trackId)).rejects.toThrow(NotFoundException)
    })

    it('reports a track that has no CMAF renditions yet', async () => {
      prisma.track.findFirst.mockResolvedValue({
        fragmentTimescale: null,
        durationTicks: null,
        audioFiles: [],
      } as never)

      await expect(service.getManifest(trackId)).rejects.toThrow(/no CMAF renditions/)
    })

    it('rejects a rendition missing its byte index instead of serving a broken manifest', async () => {
      prisma.track.findFirst.mockResolvedValue({
        ...trackWithRenditions,
        audioFiles: [{ ...trackWithRenditions.audioFiles[0], initRangeStart: null }],
      } as never)

      await expect(service.getManifest(trackId)).rejects.toThrow(ServiceUnavailableException)
    })

    it('rejects renditions whose fragment timelines are not aligned', async () => {
      prisma.track.findFirst.mockResolvedValue({
        ...trackWithRenditions,
        audioFiles: [
          trackWithRenditions.audioFiles[0],
          {
            ...trackWithRenditions.audioFiles[1],
            fragments: [[1, 2_879_999, 929, 145_762]],
          },
        ],
      } as never)

      await expect(service.getManifest(trackId)).rejects.toThrow(ServiceUnavailableException)
    })

    it('only resolves manifests for ready, non-deleted CMAF tracks', async () => {
      prisma.track.findFirst.mockResolvedValue(trackWithRenditions as never)

      await service.getManifest(trackId)

      expect(prisma.track.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: trackId,
            deletedAt: null,
            processingStatus: 'READY',
            publishedAt: { not: null },
          }),
        }),
      )
      const [query] = prisma.track.findFirst.mock.calls[0] as [{ where: object }]
      expect(query.where).not.toHaveProperty('playbackVersion')
    })
  })

  describe('openSession', () => {
    it('returns the manifest with a token from a session sized to the track', async () => {
      prisma.track.findFirst.mockResolvedValue({
        fragmentTimescale: 48_000,
        durationTicks: 480_000,
        audioFiles: [
          {
            bitrate: 128,
            codec: 'mp4a.40.2',
            size: 70_000,
            initRangeStart: 0,
            initRangeEnd: 707,
            fragments: [[0, 480_000, 929, 66_238]],
          },
        ],
      } as never)
      sessions.open.mockResolvedValue({ token: 'signed', expiresAt: 1_900_000_000 })

      const result = await service.openSession({ trackId, userId: 'user-1', deviceId: 'device-1' })

      expect(sessions.open).toHaveBeenCalledWith({
        userId: 'user-1',
        trackId,
        deviceId: 'device-1',
        durationMs: 10_000,
      })
      expect(result).toMatchObject({ token: 'signed', expiresAt: 1_900_000_000 })
      expect(result.manifest.renditions.map(({ bitrate }) => bitrate)).toEqual([128])
    })

    it('opens no session for a track that cannot play', async () => {
      prisma.track.findFirst.mockResolvedValue(null as never)

      await expect(service.openSession({ trackId, userId: 'user-1' })).rejects.toThrow(
        NotFoundException,
      )
      expect(sessions.open).not.toHaveBeenCalled()
    })
  })

  describe('getRenditionStream', () => {
    /** Init 0-707, a sidx gap, then two 10-second fragments. */
    const file = {
      url: 'tracks/x/cmaf/192.m4a',
      bitrate: 192,
      codec: 'mp4a.40.2',
      size: 133_586,
      initRangeStart: 0,
      initRangeEnd: 707,
      fragments: [
        [0, 480_000, 929, 66_238],
        [480_000, 480_000, 67_167, 66_419],
      ],
      track: { fragmentTimescale: 48_000 },
    }
    const session: AuthorizedPlaybackSession = {
      sessionId: 'session-1',
      userId: 'user-1',
      trackId,
      degraded: false,
    }
    const stream = (rangeHeader?: string) =>
      service.getRenditionStream({ trackId, bitrate: 192, rangeHeader, token: 'signed' })

    beforeEach(() => {
      prisma.trackFile.findFirst.mockResolvedValue(file as never)
      sessions.authorize.mockResolvedValue(session)
      sessions.charge.mockResolvedValue(undefined)
      storage.getObjectStream.mockImplementation((_key, range) => {
        const [, from, to] = /^bytes=(\d+)-(\d+)$/.exec(range ?? '') ?? []
        return Promise.resolve({
          stream: Readable.from([Buffer.alloc(Number(to) - Number(from) + 1)]),
          contentType: 'application/octet-stream',
        } as never)
      })
    })

    const drain = async (readable: NodeJS.ReadableStream) => {
      let bytes = 0
      for await (const chunk of readable as AsyncIterable<Buffer>) bytes += chunk.length
      return bytes
    }

    it('checks the session for this track before reading anything', async () => {
      sessions.authorize.mockRejectedValue(new ForbiddenException())

      await expect(stream('bytes=929-67166')).rejects.toThrow(ForbiddenException)

      expect(sessions.authorize).toHaveBeenCalledWith('signed', trackId)
      expect(storage.getObjectStream).not.toHaveBeenCalled()
    })

    it('answers a request without Range with the whole file, paced, as a native element expects', async () => {
      const result = await stream(undefined)

      expect(storage.getObjectStream).toHaveBeenCalledWith(file.url, 'bytes=0-133585')
      expect(result).toMatchObject({ start: 0, end: 133_585, isPartial: true, fileSize: file.size })
      expect(sessions.charge).not.toHaveBeenCalled()

      expect(await drain(result.stream)).toBe(file.size)
      const charged = sessions.charge.mock.calls.reduce((sum, [, audioMs]) => sum + audioMs, 0)
      expect(charged).toBe(20_000)
    })

    it('streams an oversized range to the end of the file instead of serving it at once', async () => {
      const result = await stream('bytes=929-133585')

      expect(storage.getObjectStream).toHaveBeenCalledWith(file.url, 'bytes=929-133585')
      expect(result.contentLength).toBe(132_657)
      expect(sessions.charge).not.toHaveBeenCalled()
    })

    it('holds a paced response back while the session is ahead of real time, then releases it', async () => {
      sessions.charge.mockRejectedValueOnce(new PlaybackPacingError(0))

      const result = await stream(undefined)

      expect(await drain(result.stream)).toBe(file.size)
      expect(sessions.charge).toHaveBeenCalledTimes(2)
    })

    it("charges the session for the fragment's ten seconds", async () => {
      await stream('bytes=67167-133585')

      expect(sessions.charge).toHaveBeenCalledWith(session, 10_000)
    })

    it('reads nothing from storage when the session is ahead of real time', async () => {
      sessions.charge.mockRejectedValue(new PlaybackPacingError(7))

      await expect(stream('bytes=929-67166')).rejects.toBeInstanceOf(PlaybackPacingError)

      expect(storage.getObjectStream).not.toHaveBeenCalled()
    })

    it('serves audio/mp4 even when storage reports a generic type', async () => {
      const result = await stream('bytes=0-707')

      expect(result.contentType).toBe('audio/mp4')
    })

    it('reports a missing rendition', async () => {
      prisma.trackFile.findFirst.mockResolvedValue(null as never)

      await expect(stream()).rejects.toThrow(/no 192k CMAF rendition/)
    })

    it('refuses to serve a rendition whose stored byte index is broken', async () => {
      prisma.trackFile.findFirst.mockResolvedValue({ ...file, fragments: 'broken' } as never)

      await expect(stream('bytes=929-67166')).rejects.toThrow(ServiceUnavailableException)
    })

    it('does not serve a rendition from a deleted, processing, or unpublished track', async () => {
      await stream()

      expect(prisma.trackFile.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            track: {
              deletedAt: null,
              processingStatus: 'READY',
              publishedAt: { not: null },
            },
          }),
        }),
      )
    })
  })
})
