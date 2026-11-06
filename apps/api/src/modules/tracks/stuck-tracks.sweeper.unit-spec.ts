import { PrismaService } from '@infra/prisma/prisma.service'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import * as Sentry from '@sentry/nestjs'
import { makeQueueMock, type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import type { Queue } from 'bullmq'
import { STUCK_PROCESSING_AFTER_MS, StuckTrackSweeper } from './stuck-tracks.sweeper'

const NOW = new Date('2026-11-06T12:00:00.000Z')
const stuck = { id: 'track-1', audioUrl: 'source.wav' }

/** A queued job as `getJob` returns it, reporting the given BullMQ state. */
const jobInState = (state: string) => ({ getState: jest.fn().mockResolvedValue(state as never) })

describe('StuckTrackSweeper', () => {
  let prisma: PrismaMock
  let audioQueue: jest.Mocked<Queue>
  let releasePublishing: jest.Mocked<Queue>
  let sweeper: StuckTrackSweeper

  beforeEach(() => {
    jest.clearAllMocks()
    resetPrismaMock()
    prisma = prismaMock
    audioQueue = makeQueueMock()
    releasePublishing = makeQueueMock()
    releasePublishing.add.mockResolvedValue({} as never)
    sweeper = new StuckTrackSweeper(prisma, audioQueue, releasePublishing)
    prisma.track.findMany.mockResolvedValue([stuck] as never)
    prisma.track.updateMany.mockResolvedValue({ count: 1 } as never)
    prisma.releaseTrack.findFirst.mockResolvedValue(null)
  })

  it('should expose runtime constructor metadata for Nest dependency injection', () => {
    // A type-only PrismaService import erases to Function here, and the worker then fails to
    // boot with "Nest can't resolve dependencies of StuckTrackSweeper".
    expect(Reflect.getMetadata('design:paramtypes', StuckTrackSweeper)).toEqual([
      PrismaService,
      Function,
      Function,
    ])
  })

  it('looks only at tracks processing for longer than the grace period', async () => {
    prisma.track.findMany.mockResolvedValue([])

    await sweeper.sweep(NOW)

    expect(prisma.track.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          processingStatus: 'PROCESSING',
          updatedAt: { lt: new Date(NOW.getTime() - STUCK_PROCESSING_AFTER_MS) },
        },
      }),
    )
    expect(prisma.track.updateMany).not.toHaveBeenCalled()
  })

  it('fails a stuck track that has no job in the queue', async () => {
    const failed = await sweeper.sweep(NOW)

    expect(audioQueue.getJob).toHaveBeenCalledWith('convert-audio-track-1-source.wav')
    expect(prisma.track.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'track-1',
        audioUrl: 'source.wav',
        processingStatus: 'PROCESSING',
        updatedAt: { lt: new Date(NOW.getTime() - STUCK_PROCESSING_AFTER_MS) },
      },
      data: expect.objectContaining({
        processingStatus: 'FAILED',
        processingError: expect.any(String),
        processingFinishedAt: NOW,
      }),
    })
    expect(failed).toBe(1)
    expect(Sentry.captureException).toHaveBeenCalledTimes(1)
  })

  it('fails a stuck track whose job already finished', async () => {
    audioQueue.getJob.mockResolvedValue(jobInState('failed') as never)

    expect(await sweeper.sweep(NOW)).toBe(1)
    expect(prisma.track.updateMany).toHaveBeenCalledTimes(1)
  })

  it.each(['waiting', 'active', 'delayed', 'prioritized', 'waiting-children'])(
    'leaves a track alone while its job is %s',
    async (state) => {
      audioQueue.getJob.mockResolvedValue(jobInState(state) as never)

      expect(await sweeper.sweep(NOW)).toBe(0)
      expect(prisma.track.updateMany).not.toHaveBeenCalled()
    },
  )

  it('settles the release a failed track belongs to, so the release stops publishing', async () => {
    prisma.releaseTrack.findFirst.mockResolvedValue({ releaseId: 'release-1' } as never)

    await sweeper.sweep(NOW)

    expect(releasePublishing.add).toHaveBeenCalledWith(
      'track-settled',
      { trackId: 'track-1' },
      expect.objectContaining({ jobId: expect.stringMatching(/^track-settled-track-1-/) }),
    )
  })

  it('does not touch the release when the track changed under the sweep', async () => {
    // A new upload or a retry between the read and the write: the conditional update matches
    // nothing, and the newer state wins.
    prisma.track.updateMany.mockResolvedValue({ count: 0 } as never)
    prisma.releaseTrack.findFirst.mockResolvedValue({ releaseId: 'release-1' } as never)

    expect(await sweeper.sweep(NOW)).toBe(0)
    expect(releasePublishing.add).not.toHaveBeenCalled()
    expect(Sentry.captureException).not.toHaveBeenCalled()
  })

  it('keeps sweeping the remaining tracks when one of them throws', async () => {
    prisma.track.findMany.mockResolvedValue([
      { id: 'track-1', audioUrl: 'a.wav' },
      { id: 'track-2', audioUrl: 'b.wav' },
    ] as never)
    audioQueue.getJob
      .mockRejectedValueOnce(new Error('redis unavailable') as never)
      .mockResolvedValueOnce(undefined as never)

    expect(await sweeper.sweep(NOW)).toBe(1)
    expect(prisma.track.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: 'track-2' }) }),
    )
  })
})
