import { mkdir, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import * as PrismaServiceModule from '@infra/prisma/prisma.service'
import {
  AUDIO_PROCESSING_DEAD_LETTER_QUEUE,
  AUDIO_PROCESSING_QUEUE,
  type ConvertAudioJob,
} from '@infra/queues/audio-processing.queue'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger } from '@nestjs/common'
import * as Sentry from '@sentry/nestjs'
import type { Job, Queue } from 'bullmq'
import { StaleAudioJobError } from './audio-artifact.types'
import { type ConversionStepContext, runConversionPhases } from './audio-processing.phases'
import { isAudioProcessingWorkerAutorunEnabled } from './audio-processing.worker-autorun'
import { getAudioGenerationRoot } from './audio-storage-keys'
import { ProcessingAttemptRecorder } from './processing-attempt.recorder'
import { classifyProcessingError, errorMessageOf } from './processing-log/classify'
import { PROCESSING_LOG_LIMITS } from './processing-log/limits'
import { processingLogSuffix } from './processing-log/log-context'
import { redactProcessingText } from './processing-log/redact'

/** Represents the audio processing consumer. */
@Processor(AUDIO_PROCESSING_QUEUE, {
  concurrency: 2,
  lockDuration: 600_000,
  stalledInterval: 30_000,
  maxStalledCount: 2,
  autorun: isAudioProcessingWorkerAutorunEnabled(),
})
export class AudioProcessingConsumer extends WorkerHost {
  /** Creates a new instance. */
  constructor(
    @Inject(PrismaServiceModule.PrismaService)
    private readonly prisma: PrismaServiceModule.PrismaService,
    @Inject(STORAGE_SERVICE)
    private readonly storage: StorageService,
    @InjectQueue(AUDIO_PROCESSING_DEAD_LETTER_QUEUE)
    private readonly deadLetterQueue: Queue<ConvertAudioJob>,
    @Inject(ProcessingAttemptRecorder)
    private readonly recorder: ProcessingAttemptRecorder,
  ) {
    super()
  }

  /** The logger value. */
  private readonly logger = new Logger(AudioProcessingConsumer.name, { timestamp: true })

  /**
   * Claims one conversion job for this worker.
   *
   * The claim is a conditional write rather than a read: it succeeds only while
   * this job's source is still the track's source, so a superseded job stops
   * before spending any CPU.
   */
  private async claimJob(job: Job<ConvertAudioJob>) {
    const { trackId, sourceFileName } = job.data
    const track = await this.prisma.track.findUnique({ where: { id: trackId } })

    if (!track || track.audioUrl !== sourceFileName) {
      this.logger.warn(`Skipping stale audio conversion job ${job.id} for track ${trackId}`)
      return false
    }

    const started = await this.prisma.track.updateMany({
      where: { id: trackId, audioUrl: sourceFileName },
      data: {
        processingStatus: 'PROCESSING',
        processingError: null,
        processingAttempts: { increment: 1 },
        processingStartedAt: new Date(),
        processingFinishedAt: null,
      },
    })

    if (started.count === 1) return true
    this.logger.warn(`Skipping superseded audio conversion job ${job.id} for track ${trackId}`)
    return false
  }

  /** Reports whether this job's source is still the track's current source. */
  private async isStillCurrent(job: Job<ConvertAudioJob>) {
    const track = await this.prisma.track.findUnique({ where: { id: job.data.trackId } })
    return Boolean(track && track.audioUrl === job.data.sourceFileName)
  }

  /** Runs the process operation. */
  async process(job: Job<ConvertAudioJob>) {
    if (job.name !== 'convert-audio') return
    if (!(await this.claimJob(job))) return

    const { trackId, sourceFileName, outputDir } = job.data
    const jobId = String(job.id)
    const attempt = job.attemptsMade + 1
    const maxAttempts = job.opts.attempts ?? 1
    const trigger = job.data.trigger ?? 'UPLOAD'

    const processingRoot = join(outputDir, '.processing')
    const temporaryRoot = join(processingRoot, `${trackId}-${jobId}-${attempt}`)

    await this.cleanupOrphanedTemporaryDirs(processingRoot, trackId, jobId)
    await rm(temporaryRoot, { recursive: true, force: true })
    await mkdir(temporaryRoot, { recursive: true })

    await this.recorder.start({
      trackId,
      sourceFileName,
      jobId,
      attempt,
      maxAttempts,
      trigger,
      input: job.data.input,
    })

    const ctx: ConversionStepContext = { step: 'PREPARE_TEMP' }

    try {
      const outcome = await runConversionPhases(ctx, {
        job,
        temporaryRoot,
        storage: this.storage,
        prisma: this.prisma,
        recorder: this.recorder,
        trackId,
        sourceFileName,
        jobId,
        attempt,
        isStillCurrent: (currentJob) => this.isStillCurrent(currentJob),
      })

      if (outcome === 'SUPERSEDED') {
        this.logger.warn(
          `Discarded superseded audio generation from job ${job.id} ${processingLogSuffix({ trackId, jobId, attempt, step: ctx.step })}`,
        )
        return
      }

      await this.recorder.succeed({ trackId, jobId, attempt })
      this.logger.log(
        `Audio conversion + storage upload completed for track ${trackId}, job ${job.id}`,
      )
    } catch (error) {
      if (error instanceof StaleAudioJobError) {
        await this.storage.deletePrefix(getAudioGenerationRoot(trackId, sourceFileName))
        await this.recorder.supersede({ trackId, jobId, attempt, step: ctx.step })
        this.logger.warn(`Discarded superseded audio generation from job ${job.id}`)
        return
      }

      const willRetry = attempt < maxAttempts
      await this.recorder.fail({
        trackId,
        jobId,
        attempt,
        step: ctx.step,
        stepDetail: ctx.stepDetail,
        error,
        willRetry,
      })
      await this.markAttemptFailed(
        job,
        redactProcessingText(errorMessageOf(error), {
          keep: 'head',
          maxBytes: PROCESSING_LOG_LIMITS.errorMessage,
        }),
      )
      throw error
    } finally {
      try {
        await rm(temporaryRoot, { recursive: true, force: true })
      } catch (cleanupError) {
        this.logger.error(
          `Failed to clean up temporary directory for job ${job.id} ${processingLogSuffix({ trackId, jobId, attempt, step: 'CLEANUP' })}`,
          cleanupError instanceof Error ? cleanupError.stack : undefined,
        )
      }
    }
  }

  /** Runs the on failed operation. */
  @OnWorkerEvent('failed')
  async onFailed(job: Job<ConvertAudioJob> | undefined, error: Error) {
    if (job?.name !== 'convert-audio') return

    const maxAttempts = job.opts.attempts ?? 1
    if (job.attemptsMade < maxAttempts) return

    const jobId = String(job.id)
    const attempt = job.attemptsMade
    const deadLetterJobId = `failed-${jobId}-${job.attemptsMade}`

    const failed = await this.prisma.track.updateMany({
      where: { id: job.data.trackId, audioUrl: job.data.sourceFileName },
      data: {
        processingStatus: 'FAILED',
        processingError: redactProcessingText(error.message, {
          keep: 'head',
          maxBytes: PROCESSING_LOG_LIMITS.errorMessage,
        }),
        processingFinishedAt: new Date(),
      },
    })
    if (failed.count !== 1) return

    try {
      await this.storage.deletePrefix(
        getAudioGenerationRoot(job.data.trackId, job.data.sourceFileName),
      )
    } catch (cleanupError) {
      this.logger.error(
        `Unable to clean failed audio generation for track ${job.data.trackId}`,
        cleanupError instanceof Error ? cleanupError.stack : undefined,
      )
    }

    await this.deadLetterQueue.add('convert-audio-failed', job.data, {
      jobId: deadLetterJobId,
      removeOnComplete: 500,
      removeOnFail: 1_000,
    })

    const failedStep = await this.recorder.finalize({
      trackId: job.data.trackId,
      sourceFileName: job.data.sourceFileName,
      jobId,
      attempt,
      deadLetterJobId,
      error,
    })

    const classified = classifyProcessingError(error)
    Sentry.captureException(error, {
      tags: {
        trackId: job.data.trackId,
        jobId,
        step: failedStep ?? 'unknown',
        errorCode: classified.code,
        trigger: job.data.trigger ?? 'UPLOAD',
      },
      fingerprint: ['audio-processing', classified.code, failedStep ?? 'unknown'],
    })

    this.logger.error(
      `Audio conversion permanently failed for track ${job.data.trackId} ${processingLogSuffix({ trackId: job.data.trackId, jobId, attempt, errorCode: classified.code })}`,
      error.stack,
    )
  }

  /** Runs the on stalled operation. */
  @OnWorkerEvent('stalled')
  async onStalled(jobId: string) {
    this.logger.warn(`Audio conversion job ${jobId} stalled and will be recovered by BullMQ`)
    await this.recorder.markStalledByJob(jobId)
  }

  /** Removes temporary directories left behind by earlier attempts of this job. */
  private async cleanupOrphanedTemporaryDirs(
    processingRoot: string,
    trackId: string,
    jobId: string,
  ) {
    try {
      const entries = await readdir(processingRoot)
      const prefix = `${trackId}-${jobId}-`
      await Promise.all(
        entries
          .filter((entry) => entry.startsWith(prefix))
          .map((entry) => rm(join(processingRoot, entry), { recursive: true, force: true })),
      )
    } catch (error) {
      if (!this.isMissingFileError(error)) throw error
    }
  }

  /**
   * Records why one attempt failed, but only while this job's source is still
   * the track's source.
   *
   * The match is part of the write rather than a preceding read: a newer upload
   * can replace `audioUrl` between a read and an update, and a read-then-write
   * would then stamp the stale error onto the newer source.
   */
  private async markAttemptFailed(job: Job<ConvertAudioJob>, message: string) {
    await this.prisma.track.updateMany({
      where: { id: job.data.trackId, audioUrl: job.data.sourceFileName },
      data: { processingError: message },
    })
  }

  /** Runs the is missing file error operation. */
  private isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && 'code' in error && error.code === 'ENOENT'
  }
}
