import type { PrismaService } from '@infra/prisma/prisma.service'
import type { StorageService } from '@infra/storage/storage.types'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { resolveRange, TrackPlaybackService } from './track-playback.service'

const FILE_SIZE = 1_000

describe('resolveRange', () => {
  it('serves the whole object when no Range header is present', () => {
    expect(resolveRange(undefined, FILE_SIZE)).toEqual({
      start: 0,
      end: 999,
      contentLength: 1_000,
      isPartial: false,
    })
  })

  it('resolves a closed range inclusively on both ends', () => {
    expect(resolveRange('bytes=100-199', FILE_SIZE)).toEqual({
      start: 100,
      end: 199,
      contentLength: 100,
      isPartial: true,
    })
  })

  it('treats an open-ended range as running to the last byte', () => {
    expect(resolveRange('bytes=900-', FILE_SIZE)).toMatchObject({
      start: 900,
      end: 999,
      contentLength: 100,
    })
  })

  it('resolves a suffix range to the trailing bytes', () => {
    expect(resolveRange('bytes=-100', FILE_SIZE)).toMatchObject({
      start: 900,
      end: 999,
      contentLength: 100,
    })
  })

  it('clamps a suffix longer than the file to the whole file', () => {
    expect(resolveRange('bytes=-5000', FILE_SIZE)).toMatchObject({ start: 0, end: 999 })
  })

  it('clamps an end beyond the last byte', () => {
    expect(resolveRange('bytes=900-99999', FILE_SIZE)).toMatchObject({ start: 900, end: 999 })
  })

  it('requests exactly one fragment when given its offset and length', () => {
    const offset = 929
    const length = 98_987

    const resolved = resolveRange(`bytes=${offset}-${offset + length - 1}`, 1_456_523)

    expect(resolved.contentLength).toBe(length)
  })

  it.each([
    ['bytes=1000-1100', 'start past the end'],
    ['bytes=500-100', 'inverted range'],
    ['bytes=abc-def', 'unparseable range'],
    ['items=0-10', 'unsupported unit'],
    ['bytes=-', 'empty range'],
    ['bytes=-0', 'zero-length suffix'],
  ])('falls back to the whole object for %s (%s)', (header) => {
    expect(resolveRange(header, FILE_SIZE).isPartial).toBe(false)
  })
})

describe('TrackPlaybackService', () => {
  let prisma: DeepMockProxy<PrismaService>
  let storage: DeepMockProxy<StorageService>
  let service: TrackPlaybackService

  const trackId = '00000000-0000-0000-0000-000000000001'

  beforeEach(() => {
    prisma = mockDeep<PrismaService>()
    storage = mockDeep<StorageService>()
    service = new TrackPlaybackService(prisma, storage)
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
          fragments: [[0, 195_584, 929, 66_238]],
        },
        {
          bitrate: 320,
          codec: 'mp4a.40.2',
          size: 2_101_902,
          initRangeStart: 0,
          initRangeEnd: 707,
          fragments: [[0, 195_584, 929, 145_762]],
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

      await expect(service.getManifest(trackId)).rejects.toThrow(/incomplete/)
    })
  })

  describe('getRenditionStream', () => {
    const file = { url: 'tracks/x/cmaf/192.m4a', size: 1_456_523 }

    beforeEach(() => {
      storage.getObjectStream.mockResolvedValue({
        stream: {} as never,
        contentType: 'audio/mp4',
      } as never)
    })

    it('reads the file size from the database rather than probing storage', async () => {
      prisma.trackFile.findUnique.mockResolvedValue(file as never)

      const result = await service.getRenditionStream(trackId, 192, 'bytes=929-100915')

      expect(storage.getObjectMeta).not.toHaveBeenCalled()
      expect(storage.getObjectStream).toHaveBeenCalledTimes(1)
      expect(result.fileSize).toBe(file.size)
    })

    it('forwards the resolved window to storage as a Range', async () => {
      prisma.trackFile.findUnique.mockResolvedValue(file as never)

      await service.getRenditionStream(trackId, 192, 'bytes=929-100915')

      expect(storage.getObjectStream).toHaveBeenCalledWith(file.url, 'bytes=929-100915')
    })

    it('serves audio/mp4 even when storage reports a generic type', async () => {
      prisma.trackFile.findUnique.mockResolvedValue(file as never)
      storage.getObjectStream.mockResolvedValue({
        stream: {} as never,
        contentType: 'application/octet-stream',
      } as never)

      const result = await service.getRenditionStream(trackId, 192, undefined)

      expect(result.contentType).toBe('audio/mp4')
    })

    it('omits the Range when the whole object is requested', async () => {
      prisma.trackFile.findUnique.mockResolvedValue(file as never)

      const result = await service.getRenditionStream(trackId, 192, undefined)

      expect(storage.getObjectStream).toHaveBeenCalledWith(file.url, undefined)
      expect(result.isPartial).toBe(false)
    })

    it('reports a missing rendition', async () => {
      prisma.trackFile.findUnique.mockResolvedValue(null as never)

      await expect(service.getRenditionStream(trackId, 192)).rejects.toThrow(
        /no 192k CMAF rendition/,
      )
    })
  })
})
