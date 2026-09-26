import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import * as Sentry from '@sentry/nestjs'
import { mockTransaction, type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { ProcessingAttemptRecorder } from './processing-attempt.recorder'

jest.mock('@sentry/nestjs', () => ({
  captureException: jest.fn(),
}))

describe('ProcessingAttemptRecorder', () => {
  let recorder: ProcessingAttemptRecorder
  let prisma: PrismaMock

  beforeEach(() => {
    jest.clearAllMocks()
    resetPrismaMock()
    prisma = prismaMock
    recorder = new ProcessingAttemptRecorder(prisma)
    mockTransaction(prisma)
    prisma.trackProcessingAttempt.findMany.mockResolvedValue([] as never)
    prisma.trackProcessingAttempt.deleteMany.mockResolvedValue({ count: 0 } as never)
  })

  describe('start', () => {
    it('marks older RUNNING rows for the same job or generation STALLED, then opens a new one', async () => {
      prisma.trackProcessingAttempt.updateMany.mockResolvedValue({ count: 1 } as never)
      prisma.trackProcessingAttempt.create.mockResolvedValue({} as never)

      await recorder.start({
        trackId: 'track-1',
        sourceFileName: 'track.mp3',
        jobId: 'job-1',
        attempt: 2,
        maxAttempts: 5,
        trigger: 'UPLOAD',
        input: { bytes: 1_000, codec: 'mp3', container: 'mp3', bitrateKbps: 128, durationSec: 200 },
      })

      expect(prisma.trackProcessingAttempt.updateMany).toHaveBeenCalledWith({
        where: {
          status: 'RUNNING',
          OR: [{ jobId: 'job-1' }, { trackId: 'track-1', sourceFileName: 'track.mp3' }],
        },
        data: { status: 'STALLED', errorCode: 'STALLED', finishedAt: expect.any(Date) },
      })
      expect(prisma.trackProcessingAttempt.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          trackId: 'track-1',
          jobId: 'job-1',
          attempt: 2,
          maxAttempts: 5,
          trigger: 'UPLOAD',
          status: 'RUNNING',
          inputBytes: 1_000,
          inputCodec: 'mp3',
        }),
      })
    })

    it('swallows a Prisma rejection and reports it to Sentry instead of throwing', async () => {
      prisma.trackProcessingAttempt.updateMany.mockRejectedValue(new Error('db down') as never)

      await expect(
        recorder.start({
          trackId: 'track-1',
          sourceFileName: 'track.mp3',
          jobId: 'job-1',
          attempt: 1,
          maxAttempts: 5,
          trigger: 'UPLOAD',
        }),
      ).resolves.toBeUndefined()

      expect(Sentry.captureException).toHaveBeenCalled()
    })
  })

  describe('succeed', () => {
    it('marks the RUNNING row SUCCEEDED with a duration and prunes old rows', async () => {
      const startedAt = new Date(Date.now() - 5_000)
      prisma.trackProcessingAttempt.findFirst.mockResolvedValue({
        id: 'row-1',
        startedAt,
      } as never)
      prisma.trackProcessingAttempt.update.mockResolvedValue({} as never)
      prisma.trackProcessingAttempt.findMany.mockResolvedValue([
        { id: 'old-1' },
        { id: 'old-2' },
      ] as never)

      await recorder.succeed({ trackId: 'track-1', jobId: 'job-1', attempt: 1 })

      expect(prisma.trackProcessingAttempt.update).toHaveBeenCalledWith({
        where: { id: 'row-1' },
        data: expect.objectContaining({ status: 'SUCCEEDED', durationMs: expect.any(Number) }),
      })
      expect(prisma.trackProcessingAttempt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { trackId: 'track-1' }, skip: 25 }),
      )
      expect(prisma.trackProcessingAttempt.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['old-1', 'old-2'] } },
      })
    })

    it('does nothing to update but still prunes when no RUNNING row is found', async () => {
      prisma.trackProcessingAttempt.findFirst.mockResolvedValue(null as never)

      await recorder.succeed({ trackId: 'track-1', jobId: 'job-1', attempt: 1 })

      expect(prisma.trackProcessingAttempt.update).not.toHaveBeenCalled()
      expect(prisma.trackProcessingAttempt.findMany).toHaveBeenCalled()
    })

    it('swallows a Prisma rejection and reports it to Sentry', async () => {
      prisma.$transaction.mockRejectedValueOnce(new Error('db down') as never)

      await expect(
        recorder.succeed({ trackId: 'track-1', jobId: 'job-1', attempt: 1 }),
      ).resolves.toBeUndefined()

      expect(Sentry.captureException).toHaveBeenCalled()
    })
  })

  describe('supersede', () => {
    it('marks the RUNNING row SUPERSEDED with the failing step', async () => {
      prisma.trackProcessingAttempt.findFirst.mockResolvedValue({
        id: 'row-1',
        startedAt: new Date(),
      } as never)
      prisma.trackProcessingAttempt.update.mockResolvedValue({} as never)

      await recorder.supersede({
        trackId: 'track-1',
        jobId: 'job-1',
        attempt: 1,
        step: 'UPLOAD',
      })

      expect(prisma.trackProcessingAttempt.update).toHaveBeenCalledWith({
        where: { id: 'row-1' },
        data: expect.objectContaining({ status: 'SUPERSEDED', failedStep: 'UPLOAD' }),
      })
    })

    it('swallows a Prisma rejection and reports it to Sentry', async () => {
      prisma.$transaction.mockRejectedValueOnce(new Error('db down') as never)

      await expect(
        recorder.supersede({ trackId: 'track-1', jobId: 'job-1', attempt: 1, step: 'UPLOAD' }),
      ).resolves.toBeUndefined()

      expect(Sentry.captureException).toHaveBeenCalled()
    })
  })

  describe('fail', () => {
    it('stores the classified, redacted diagnostics on the RUNNING row', async () => {
      prisma.trackProcessingAttempt.findFirst.mockResolvedValue({
        id: 'row-1',
        startedAt: new Date(Date.now() - 2_000),
      } as never)
      prisma.trackProcessingAttempt.update.mockResolvedValue({} as never)

      await recorder.fail({
        trackId: 'track-1',
        jobId: 'job-1',
        attempt: 1,
        step: 'PROGRESSIVE_ENCODE',
        stepDetail: '192k',
        error: new Error(
          'Converted audio file is empty: /storage/.processing/track-1-job-1-1/a.opus',
        ),
        willRetry: true,
      })

      expect(prisma.trackProcessingAttempt.update).toHaveBeenCalledWith({
        where: { id: 'row-1' },
        data: expect.objectContaining({
          status: 'FAILED',
          willRetry: true,
          failedStep: 'PROGRESSIVE_ENCODE',
          stepDetail: '192k',
          errorCode: 'EMPTY_OUTPUT',
          errorMessage: 'Converted audio file is empty: <tracks>/track-1-job-1-1/a.opus',
        }),
      })
    })

    it('swallows a Prisma rejection and reports it to Sentry', async () => {
      prisma.$transaction.mockRejectedValueOnce(new Error('db down') as never)

      await expect(
        recorder.fail({
          trackId: 'track-1',
          jobId: 'job-1',
          attempt: 1,
          step: 'UPLOAD',
          error: new Error('boom'),
          willRetry: false,
        }),
      ).resolves.toBeUndefined()

      expect(Sentry.captureException).toHaveBeenCalled()
    })
  })

  describe('markStalledByJob', () => {
    it('marks every RUNNING row for the job STALLED', async () => {
      prisma.trackProcessingAttempt.updateMany.mockResolvedValue({ count: 1 } as never)

      await recorder.markStalledByJob('job-1')

      expect(prisma.trackProcessingAttempt.updateMany).toHaveBeenCalledWith({
        where: { jobId: 'job-1', status: 'RUNNING' },
        data: { status: 'STALLED', errorCode: 'STALLED', finishedAt: expect.any(Date) },
      })
    })

    it('swallows a Prisma rejection and reports it to Sentry', async () => {
      prisma.trackProcessingAttempt.updateMany.mockRejectedValue(new Error('db down') as never)

      await expect(recorder.markStalledByJob('job-1')).resolves.toBeUndefined()

      expect(Sentry.captureException).toHaveBeenCalled()
    })
  })

  describe('finalize', () => {
    it('stamps deadLetterJobId onto the existing row and returns its failedStep', async () => {
      prisma.trackProcessingAttempt.findFirst.mockResolvedValue({
        id: 'row-1',
        failedStep: 'CMAF_ENCODE',
        finishedAt: null,
      } as never)
      prisma.trackProcessingAttempt.update.mockResolvedValue({} as never)

      const result = await recorder.finalize({
        trackId: 'track-1',
        sourceFileName: 'track.mp3',
        jobId: 'job-1',
        attempt: 5,
        deadLetterJobId: 'failed-job-1-5',
        error: new Error('boom'),
      })

      expect(result).toBe('CMAF_ENCODE')
      expect(prisma.trackProcessingAttempt.update).toHaveBeenCalledWith({
        where: { id: 'row-1' },
        data: expect.objectContaining({
          status: 'FAILED',
          willRetry: false,
          deadLetterJobId: 'failed-job-1-5',
        }),
      })
      expect(prisma.trackProcessingAttempt.create).not.toHaveBeenCalled()
    })

    it('inserts a synthetic STALLED row when BullMQ failed the job without a matching attempt', async () => {
      prisma.trackProcessingAttempt.findFirst.mockResolvedValue(null as never)
      prisma.trackProcessingAttempt.create.mockResolvedValue({} as never)

      const result = await recorder.finalize({
        trackId: 'track-1',
        sourceFileName: 'track.mp3',
        jobId: 'job-1',
        attempt: 5,
        deadLetterJobId: 'failed-job-1-5',
        error: new Error('job stalled more than allowable limit'),
      })

      expect(result).toBeNull()
      expect(prisma.trackProcessingAttempt.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          trackId: 'track-1',
          attempt: 5,
          status: 'FAILED',
          errorCode: 'STALLED',
          deadLetterJobId: 'failed-job-1-5',
        }),
      })
    })

    it('inserts a synthetic UNKNOWN row for a non-stall message with no matching attempt', async () => {
      prisma.trackProcessingAttempt.findFirst.mockResolvedValue(null as never)
      prisma.trackProcessingAttempt.create.mockResolvedValue({} as never)

      await recorder.finalize({
        trackId: 'track-1',
        sourceFileName: 'track.mp3',
        jobId: 'job-1',
        attempt: 5,
        deadLetterJobId: 'failed-job-1-5',
        error: new Error('worker crashed unexpectedly'),
      })

      expect(prisma.trackProcessingAttempt.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ errorCode: 'UNKNOWN' }),
      })
    })

    it('swallows a Prisma rejection and returns undefined', async () => {
      prisma.$transaction.mockRejectedValueOnce(new Error('db down') as never)

      const result = await recorder.finalize({
        trackId: 'track-1',
        sourceFileName: 'track.mp3',
        jobId: 'job-1',
        attempt: 1,
        deadLetterJobId: 'failed-job-1-1',
        error: new Error('boom'),
      })

      expect(result).toBeUndefined()
      expect(Sentry.captureException).toHaveBeenCalled()
    })
  })

  describe('recordEnqueueFailure', () => {
    it('creates an attempt-0 FAILED row attributed to CLAIM', async () => {
      prisma.trackProcessingAttempt.create.mockResolvedValue({} as never)

      await recorder.recordEnqueueFailure({
        trackId: 'track-1',
        sourceFileName: 'track.mp3',
        jobId: 'convert-audio-track-1-track.mp3',
        trigger: 'UPLOAD',
        error: new Error('Redis unavailable'),
      })

      expect(prisma.trackProcessingAttempt.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          trackId: 'track-1',
          attempt: 0,
          maxAttempts: 0,
          status: 'FAILED',
          failedStep: 'CLAIM',
          errorMessage: 'Redis unavailable',
        }),
      })
    })

    it('swallows a Prisma rejection and reports it to Sentry', async () => {
      prisma.$transaction.mockRejectedValueOnce(new Error('db down') as never)

      await expect(
        recorder.recordEnqueueFailure({
          trackId: 'track-1',
          sourceFileName: 'track.mp3',
          jobId: 'job-1',
          trigger: 'UPLOAD',
          error: new Error('boom'),
        }),
      ).resolves.toBeUndefined()

      expect(Sentry.captureException).toHaveBeenCalled()
    })
  })
})
