import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import type { RecordPlaybackEventDto } from './dtos'
import { RECOMMENDATION_ERRORS } from './errors'
import { PLAYBACK_EVENT_RETENTION_MONTHS, PlaybackEventsService } from './playback-events.service'
import { SYSTEM_CHOSEN_WEIGHT } from './taste-weight'

const NOW = new Date('2026-11-19T12:00:00.000Z')
const USER = '0199aee0-0000-7000-8000-000000000001'
const TRACK = '0199aee0-0000-7000-8000-000000000002'
const PLAY = '0199aee0-0000-7000-8000-000000000003'

const event = (overrides: Partial<RecordPlaybackEventDto> = {}): RecordPlaybackEventDto => ({
  clientPlayId: PLAY,
  trackId: TRACK,
  startedAt: '2026-11-19T11:55:00.000Z',
  endedAt: '2026-11-19T11:58:00.000Z',
  listenedMs: 180_000,
  endReason: 'COMPLETED',
  source: 'PLAYLIST',
  sourceId: '0199aee0-0000-7000-8000-000000000004',
  ...overrides,
})

describe('PlaybackEventsService', () => {
  let prisma: PrismaMock
  let service: PlaybackEventsService

  beforeEach(() => {
    jest.useFakeTimers({ now: NOW })
    resetPrismaMock()
    prisma = prismaMock
    service = new PlaybackEventsService(prisma)
    prisma.userSettings.findUnique.mockResolvedValue(null)
    prisma.track.findFirst.mockResolvedValue({ duration: 200 } as never)
    prisma.playbackEvent.createMany.mockResolvedValue({ count: 1 })
  })

  /** The single row the last `record` call handed to `createMany`. */
  const storedEvent = () => {
    const data = prisma.playbackEvent.createMany.mock.calls[0]?.[0]?.data
    return Array.isArray(data) ? data[0] : data
  }

  describe('record', () => {
    it('stores a finished play with the catalogue duration and the taste weight', async () => {
      await expect(service.record(USER, event())).resolves.toEqual({ recorded: true })

      expect(prisma.playbackEvent.createMany).toHaveBeenCalledWith({
        data: [
          {
            userId: USER,
            trackId: TRACK,
            clientPlayId: PLAY,
            startedAt: new Date('2026-11-19T11:55:00.000Z'),
            endedAt: new Date('2026-11-19T11:58:00.000Z'),
            listenedMs: 180_000,
            durationMs: 200_000,
            endReason: 'COMPLETED',
            source: 'PLAYLIST',
            sourceId: '0199aee0-0000-7000-8000-000000000004',
            tasteWeight: 1,
          },
        ],
        skipDuplicates: true,
      })
    })

    it('only looks up tracks the catalogue serves', async () => {
      await service.record(USER, event())

      expect(prisma.track.findFirst).toHaveBeenCalledWith({
        where: {
          id: TRACK,
          processingStatus: 'READY',
          deletedAt: null,
          publishedAt: { not: null },
        },
        select: { duration: true },
      })
    })

    it('stores nothing during a private session', async () => {
      prisma.userSettings.findUnique.mockResolvedValue({ privateSession: true } as never)

      await expect(service.record(USER, event())).resolves.toEqual({ recorded: false })
      expect(prisma.playbackEvent.createMany).not.toHaveBeenCalled()
    })

    it('treats a retried report of the same play as recorded without storing it twice', async () => {
      prisma.playbackEvent.createMany.mockResolvedValue({ count: 0 })

      await expect(service.record(USER, event())).resolves.toEqual({ recorded: true })
      expect(prisma.playbackEvent.createMany).toHaveBeenCalledWith(
        expect.objectContaining({ skipDuplicates: true }),
      )
    })

    it('down-weights a play the system chose', async () => {
      await service.record(USER, event({ source: 'AUTOPLAY', sourceId: undefined }))

      expect(storedEvent()?.tasteWeight).toBe(SYSTEM_CHOSEN_WEIGHT)
      expect(storedEvent()?.sourceId).toBeNull()
    })

    it('falls back to the listened time when the catalogue has no duration', async () => {
      prisma.track.findFirst.mockResolvedValue({ duration: null } as never)

      await service.record(USER, event({ listenedMs: 90_000 }))

      expect(storedEvent()?.durationMs).toBe(90_000)
    })

    it('rejects a track the catalogue does not serve', async () => {
      prisma.track.findFirst.mockResolvedValue(null)

      await expect(service.record(USER, event())).rejects.toEqual(
        new NotFoundException(RECOMMENDATION_ERRORS.TRACK_NOT_FOUND),
      )
      expect(prisma.playbackEvent.createMany).not.toHaveBeenCalled()
    })

    it('rejects a play that ends in the future beyond clock skew', async () => {
      await expect(
        service.record(USER, event({ endedAt: '2026-11-19T12:10:00.000Z' })),
      ).rejects.toEqual(new BadRequestException(RECOMMENDATION_ERRORS.EVENT_OUT_OF_RANGE))
    })

    it('accepts a play that ends slightly ahead of the server clock', async () => {
      await expect(
        service.record(USER, event({ endedAt: '2026-11-19T12:01:00.000Z' })),
      ).resolves.toEqual({ recorded: true })
    })

    it('rejects a play reported more than a week late', async () => {
      await expect(
        service.record(
          USER,
          event({ startedAt: '2026-11-11T11:00:00.000Z', endedAt: '2026-11-11T11:03:00.000Z' }),
        ),
      ).rejects.toEqual(new BadRequestException(RECOMMENDATION_ERRORS.EVENT_OUT_OF_RANGE))
    })
  })

  describe('removeExpired', () => {
    it('deletes events older than the retention window in batches until none remain', async () => {
      prisma.executeRaw
        .mockResolvedValueOnce(10_000)
        .mockResolvedValueOnce(10_000)
        .mockResolvedValueOnce(42)

      await expect(service.removeExpired()).resolves.toBe(20_042)
      expect(prisma.executeRaw).toHaveBeenCalledTimes(3)
    })

    it('uses a cutoff of the retention window in calendar months', async () => {
      prisma.executeRaw.mockResolvedValueOnce(0)

      await service.removeExpired()

      const [sql] = prisma.executeRaw.mock.calls[0] as [{ values: unknown[] }]
      const cutoff = new Date(NOW)
      cutoff.setUTCMonth(cutoff.getUTCMonth() - PLAYBACK_EVENT_RETENTION_MONTHS)
      expect(sql.values).toContainEqual(cutoff)
      expect(PLAYBACK_EVENT_RETENTION_MONTHS).toBe(13)
    })
  })
})
