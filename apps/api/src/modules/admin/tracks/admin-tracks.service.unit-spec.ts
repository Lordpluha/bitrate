import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { TrackUploadService } from '@modules/tracks'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'

/** `TrackUploadService` pulls in `music-metadata` via `track-media.ts`; that package
 * cannot be resolved under Jest, so every spec that reaches it mocks it virtually. */
jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

import { buildTrack, buildTrackWithArtist } from './__tests__/fixtures/admin-tracks.fixtures'
import { AdminTracksService } from './admin-tracks.service'
import { TrackNotFoundException } from './errors'

const makeTrackUploadMock = () =>
  ({
    reprocess: jest.fn(),
  }) as unknown as jest.Mocked<TrackUploadService>

describe('AdminTracksService', () => {
  let service: AdminTracksService
  let prisma: PrismaMock
  let trackUpload: jest.Mocked<TrackUploadService>

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    trackUpload = makeTrackUploadMock()
    service = new AdminTracksService(prisma, trackUpload)
  })

  describe('findAll', () => {
    it('hydrates rows in the id order the raw query returned, with artist usernames attached', async () => {
      const failed = buildTrackWithArtist(
        { id: 'track-failed', processingStatus: 'FAILED' },
        'dj-failed',
      )
      const ready = buildTrackWithArtist(
        { id: 'track-ready', processingStatus: 'READY' },
        'dj-ready',
      )

      prisma.queryRaw.mockResolvedValue([{ id: 'track-failed' }, { id: 'track-ready' }] as never)
      prisma.track.count.mockResolvedValue(2)
      // findMany does not preserve `IN` order — return them reversed to prove reordering works.
      prisma.track.findMany.mockResolvedValue([ready, failed] as never)

      const result = await service.findAll({ page: 1, limit: 20 })

      expect(result.total).toBe(2)
      expect(result.data.map((row) => row.id)).toEqual(['track-failed', 'track-ready'])
      expect(result.data[0]?.artistUsername).toBe('dj-failed')
    })

    it('returns an empty page without querying findMany when no ids match', async () => {
      prisma.queryRaw.mockResolvedValue([] as never)
      prisma.track.count.mockResolvedValue(0)

      const result = await service.findAll({})

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 })
      expect(prisma.track.findMany).not.toHaveBeenCalled()
    })

    it('drops an id the second query no longer returns instead of throwing', async () => {
      prisma.queryRaw.mockResolvedValue([{ id: 'gone' }] as never)
      prisma.track.count.mockResolvedValue(1)
      prisma.track.findMany.mockResolvedValue([] as never)

      const result = await service.findAll({})

      expect(result.data).toEqual([])
    })
  })

  describe('findById', () => {
    it('throws TrackNotFoundException when the track does not exist', async () => {
      prisma.track.findFirst.mockResolvedValue(null)

      await expect(service.findById('missing')).rejects.toThrow(TrackNotFoundException)
    })

    it('returns the flattened row with artistUsername when found', async () => {
      const track = buildTrackWithArtist({ id: 'track-1' }, 'dj-test')
      prisma.track.findFirst.mockResolvedValue(track as never)

      const result = await service.findById('track-1')

      expect(result.artistUsername).toBe('dj-test')
      expect(result.id).toBe('track-1')
    })
  })

  describe('reprocess', () => {
    it('throws TrackNotFoundException when the track does not exist', async () => {
      prisma.track.findFirst.mockResolvedValue(null)

      await expect(service.reprocess('missing')).rejects.toThrow(TrackNotFoundException)
      expect(trackUpload.reprocess).not.toHaveBeenCalled()
    })

    it('delegates to TrackUploadService.reprocess — reuses the existing producer', async () => {
      prisma.track.findFirst.mockResolvedValue(buildTrack({ id: 'track-1' }) as never)
      trackUpload.reprocess.mockResolvedValue(buildTrack({ id: 'track-1' }) as never)

      await service.reprocess('track-1')

      expect(trackUpload.reprocess).toHaveBeenCalledWith('track-1')
    })
  })
})
