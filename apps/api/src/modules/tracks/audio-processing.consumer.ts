import { readdir, rm } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  AUDIO_PROCESSING_DEAD_LETTER_QUEUE,
  AUDIO_PROCESSING_QUEUE,
  type ConvertAudioJob,
  parseConvertAudioJob,
  type UnrecognisedAudioJob,
} from '@infra/queues/audio-processing.queue'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { NotificationsProducer } from '@modules/notifications'
import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger, type OnModuleInit } from '@nestjs/common'
import type { TrackProcessingStep, TrackProcessingTrigger } from '@prisma/client'
import * as Sentry from '@sentry/nestjs'
import type { Job, Queue } from 'bullmq'
import { StaleAudioJobError } from './audio-artifact.types'
import { downloadObjectToFile } from './audio-master'
import { type ConversionStepContext, runConversionPhases } from './audio-processing.phases'
import { isAudioProcessingWorkerAutorunEnabled } from './audio-processing.worker-autorun'
import { createJobScratchDir, getJobScratchBase, removeStaleScratchDirs } from './audio-scratch'
import { getAudioGenerationRoot } from './audio-storage-keys'
import { ProcessingAttemptRecorder } from './processing-attempt.recorder'
import { classifyProcessingError, errorMessageOf } from './processing-log/classify'
import { PROCESSING_LOG_LIMITS } from './processing-log/limits'
import { processingLogSuffix } from './processing-log/log-context'
import { redactProcessingText } from './processing-log/redact'

/** Facts one claimed conversion attempt carries through its steps. */
type ConversionRun = {
  job: Job<ConvertAudioJob>
  data: ConvertAudioJob
  jobId: string
  attempt: number
  maxAttempts: number
  trigger: TrackProcessingTrigger
  /** The job's owner-only scratch directory. */
  temporaryRoot: string
}

/** Identifies the final attempt in a permanent-failure report. */
type PermanentFailureContext = {
  jobId: string
  attempt: number
  failedStep: TrackProcessingStep | null | undefined
}

/** BullMQ worker that converts uploaded masters into playable renditions. */
@Processor(AUDIO_PROCESSING_QUEUE, {
  concurrency: 2,
  lockDuration: 600_000,
  stalledInterval: 30_000,
  maxStalledCount: 2,
  autorun: isAudioProcessingWorkerAutorunEnabled(),
})
export class AudioProcessingConsumer extends WorkerHost implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE)
    private readonly storage: StorageService,
    @InjectQueue(AUDIO_PROCESSING_DEAD_LETTER_QUEUE)
    private readonly deadLetterQueue: Queue<ConvertAudioJob | UnrecognisedAudioJob>,
    private readonly recorder: ProcessingAttemptRecorder,
    private readonly notifications: NotificationsProducer,
  ) {
    super()
  }

  private readonly logger = new Logger(AudioProcessingConsumer.name, { timestamp: true })

  /**
   * Removes scratch directories a crashed run left behind. Only a process that actually
   * consumes jobs does this, so an API with the consumer disabled never touches another
   * process's scratch space.
   */
  async onModuleInit() {
    if (!isAudioProcessingWorkerAutorunEnabled()) return
    try {
      await removeStaleScratchDirs(getJobScratchBase())
    } catch (error) {
      this.logger.error(
        'Unable to remove stale audio scratch directories',
        error instanceof Error ? error.stack : undefined,
      )
    }
  }

  /**
   * Claims one conversion job for this worker.
   *
   * The claim is a conditional write rather than a read: it succeeds only while
   * this job's source is still the track's source, so a superseded job stops
   * before spending any CPU.
   */
  private async claimJob(job: Job, data: ConvertAudioJob) {
    const { trackId, sourceFileName } = data
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
  private async isStillCurrent(data: ConvertAudioJob) {
    const matching = await this.prisma.track.count({
      where: { id: data.trackId, audioUrl: data.sourceFileName },
    })
    return matching > 0
  }

  /** Converts one claimed upload, recording the attempt either way. */
  async process(job: Job) {
    if (job.name !== 'convert-audio') return

    const parsed = parseConvertAudioJob(job.data)
    if (!parsed.success) {
      await this.rejectUnrecognisedJob(job, parsed.reason)
      return
    }
    const data = parsed.data
    if (!(await this.claimJob(job, data))) return

    const run = await this.startRun(job as Job<ConvertAudioJob>, data)
    const ctx: ConversionStepContext = { step: 'PREPARE_TEMP' }

    try {
      await this.convert(run, ctx)
    } catch (error) {
      if (error instanceof StaleAudioJobError) {
        await this.discardStaleGeneration(run, ctx)
        return
      }
      await this.recordAttemptFailure(run, ctx, error)
      throw error
    } finally {
      await this.removeScratchDir(run)
    }
  }

  /** Prepares the job's scratch directory and opens its attempt row. */
  private async startRun(job: Job<ConvertAudioJob>, data: ConvertAudioJob): Promise<ConversionRun> {
    const { trackId, sourceFileName } = data
    const jobId = String(job.id)
    const attempt = job.attemptsMade + 1
    const maxAttempts = job.opts.attempts ?? 1
    const trigger = data.trigger ?? 'UPLOAD'

    const scratchBase = getJobScratchBase()
    await this.cleanupOrphanedTemporaryDirs(scratchBase, trackId, jobId)
    // An unpredictable, owner-only directory; every path below derives from it.
    const temporaryRoot = await createJobScratchDir(scratchBase, `${trackId}-${jobId}-${attempt}-`)

    await this.recorder.start({
      trackId,
      sourceFileName,
      jobId,
      attempt,
      maxAttempts,
      trigger,
      input: data.input,
    })

    return { job, data, jobId, attempt, maxAttempts, trigger, temporaryRoot }
  }

  /** Fetches the master, runs the conversion phases and publishes the result. */
  private async convert(run: ConversionRun, ctx: ConversionStepContext) {
    const { job, data, jobId, attempt, temporaryRoot } = run
    const { trackId, sourceFileName, masterKey } = data
    const inputPath = join(temporaryRoot, `source${extname(sourceFileName)}`)

    await downloadObjectToFile(this.storage, masterKey, inputPath)

    const outcome = await runConversionPhases(ctx, {
      job,
      inputPath,
      temporaryRoot,
      storage: this.storage,
      prisma: this.prisma,
      recorder: this.recorder,
      trackId,
      sourceFileName,
      jobId,
      attempt,
      isStillCurrent: () => this.isStillCurrent(data),
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
    if (run.trigger === 'UPLOAD') await this.notifyTrackPublished(trackId)
  }

  /** A first upload is a new release for the artist's followers; best effort, never fails the job. */
  private async notifyTrackPublished(trackId: string) {
    try {
      await this.notifications.trackPublished({ trackId })
    } catch (error) {
      this.logger.warn(
        `Could not queue the release notification for track ${trackId}: ${errorMessageOf(error)}`,
      )
    }
  }

  /** Drops the generation a superseded job wrote and closes its attempt as superseded. */
  private async discardStaleGeneration(run: ConversionRun, ctx: ConversionStepContext) {
    const { job, data, jobId, attempt } = run
    await this.storage.deletePrefix(getAudioGenerationRoot(data.trackId, data.sourceFileName))
    await this.recorder.supersede({ trackId: data.trackId, jobId, attempt, step: ctx.step })
    this.logger.warn(`Discarded superseded audio generation from job ${job.id}`)
  }

  /** Records a failed attempt on its attempt row and on the track. */
  private async recordAttemptFailure(
    run: ConversionRun,
    ctx: ConversionStepContext,
    error: unknown,
  ) {
    const { data, jobId, attempt, maxAttempts } = run
    await this.recorder.fail({
      trackId: data.trackId,
      jobId,
      attempt,
      step: ctx.step,
      stepDetail: ctx.stepDetail,
      error,
      willRetry: attempt < maxAttempts,
    })
    await this.markAttemptFailed(
      data,
      redactProcessingText(errorMessageOf(error), {
        keep: 'head',
        maxBytes: PROCESSING_LOG_LIMITS.errorMessage,
      }),
    )
  }

  /** Removes the job's scratch directory; a cleanup failure is logged, never thrown. */
  private async removeScratchDir(run: ConversionRun) {
    const { job, data, jobId, attempt, temporaryRoot } = run
    try {
      await rm(temporaryRoot, { recursive: true, force: true })
    } catch (cleanupError) {
      this.logger.error(
        `Failed to clean up temporary directory for job ${job.id} ${processingLogSuffix({ trackId: data.trackId, jobId, attempt, step: 'CLEANUP' })}`,
        cleanupError instanceof Error ? cleanupError.stack : undefined,
      )
    }
  }

  /** After the final attempt: marks the track FAILED and dead-letters the job. */
  @OnWorkerEvent('failed')
  async onFailed(job: Job<ConvertAudioJob> | undefined, error: Error) {
    if (job?.name !== 'convert-audio') return

    const maxAttempts = job.opts.attempts ?? 1
    if (job.attemptsMade < maxAttempts) return

    const jobId = String(job.id)
    const attempt = job.attemptsMade
    const deadLetterJobId = `failed-${jobId}-${job.attemptsMade}`

    if (!(await this.markTrackFailed(job.data, error))) return
    await this.removeFailedGeneration(job.data)

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

    this.reportPermanentFailure(job.data, { jobId, attempt, failedStep }, error)
  }

  /** Marks the track FAILED while this job's source is still current; false once superseded. */
  private async markTrackFailed(data: ConvertAudioJob, error: Error) {
    const failed = await this.prisma.track.updateMany({
      where: { id: data.trackId, audioUrl: data.sourceFileName },
      data: {
        processingStatus: 'FAILED',
        processingError: redactProcessingText(error.message, {
          keep: 'head',
          maxBytes: PROCESSING_LOG_LIMITS.errorMessage,
        }),
        processingFinishedAt: new Date(),
      },
    })
    return failed.count === 1
  }

  /** Deletes a permanently failed job's partial generation; a failure is only logged. */
  private async removeFailedGeneration(data: ConvertAudioJob) {
    try {
      await this.storage.deletePrefix(getAudioGenerationRoot(data.trackId, data.sourceFileName))
    } catch (cleanupError) {
      this.logger.error(
        `Unable to clean failed audio generation for track ${data.trackId}`,
        cleanupError instanceof Error ? cleanupError.stack : undefined,
      )
    }
  }

  /** Sends a permanent failure to Sentry and the log, grouped by error code and step. */
  private reportPermanentFailure(
    data: ConvertAudioJob,
    { jobId, attempt, failedStep }: PermanentFailureContext,
    error: Error,
  ) {
    const classified = classifyProcessingError(error)
    Sentry.captureException(error, {
      tags: {
        trackId: data.trackId,
        jobId,
        step: failedStep ?? 'unknown',
        errorCode: classified.code,
        trigger: data.trigger ?? 'UPLOAD',
      },
      fingerprint: ['audio-processing', classified.code, failedStep ?? 'unknown'],
    })

    this.logger.error(
      `Audio conversion permanently failed for track ${data.trackId} ${processingLogSuffix({ trackId: data.trackId, jobId, attempt, errorCode: classified.code })}`,
      error.stack,
    )
  }

  /** Closes a stalled job's RUNNING attempt row. */
  @OnWorkerEvent('stalled')
  async onStalled(jobId: string) {
    this.logger.warn(`Audio conversion job ${jobId} stalled and will be recovered by BullMQ`)
    await this.recorder.markStalledByJob(jobId)
  }

  /**
   * Moves a payload this consumer cannot interpret to the dead-letter queue, recording why.
   * The job then completes instead of throwing, so BullMQ never retries it.
   */
  private async rejectUnrecognisedJob(job: Job, reason: string) {
    this.logger.error(`Unrecognised audio conversion payload in job ${job.id}: ${reason}`)
    await this.deadLetterQueue.add(
      'convert-audio-unrecognised',
      { reason, originalJobId: job.id, payload: job.data },
      { jobId: `unrecognised-${job.id}`, removeOnComplete: 500, removeOnFail: 1_000 },
    )
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
  private async markAttemptFailed(data: ConvertAudioJob, message: string) {
    await this.prisma.track.updateMany({
      where: { id: data.trackId, audioUrl: data.sourceFileName },
      data: { processingError: message },
    })
  }

  private isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && 'code' in error && error.code === 'ENOENT'
  }
}
