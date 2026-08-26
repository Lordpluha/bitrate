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
import type { Job, Queue } from 'bullmq'
import { StaleAudioJobError } from './audio-artifact.types'
import { uploadArtifacts } from './audio-artifact-storage'
import { generateCmaf, generateHls, prepareVariants, validateHls } from './audio-encoding'
import { getAudioGenerationRoot } from './audio-storage-keys'
import { publishTrackFiles } from './audio-track-publication'

/** Progress checkpoints reported once encoding has finished. */
const PROGRESS = { hlsReady: 92, cmafReady: 94, uploaded: 98, done: 100 } as const

/** Represents the audio processing consumer. */
@Processor(AUDIO_PROCESSING_QUEUE, {
  concurrency: 2,
  lockDuration: 600_000,
  stalledInterval: 30_000,
  maxStalledCount: 2,
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

    const { trackId, sourceFileName, outputDir, format, bitrates } = job.data
    const processingRoot = join(outputDir, '.processing')
    const temporaryRoot = join(
      processingRoot,
      `${trackId}-${String(job.id)}-${job.attemptsMade + 1}`,
    )

    await this.cleanupOrphanedTemporaryDirs(processingRoot, trackId, String(job.id))
    await rm(temporaryRoot, { recursive: true, force: true })
    await mkdir(temporaryRoot, { recursive: true })

    try {
      /** Phase 1: encode progressive Opus variants. */
      const variants = await prepareVariants(job, temporaryRoot)
      if (!(await this.isStillCurrent(job))) {
        this.logger.warn(`Discarding stale conversion result from job ${job.id}`)
        return
      }

      /**
       * Phase 2: generate one aligned multi-bitrate HLS package.
       * Superseded by the CMAF package below; kept until the CMAF path ships. See ADR-0020.
       */
      const temporaryHlsPath = join(temporaryRoot, 'hls')
      await generateHls(job, temporaryHlsPath, bitrates)
      await validateHls(temporaryHlsPath, bitrates)
      await job.updateProgress(PROGRESS.hlsReady)

      /** Phase 3: encode the single-file CMAF renditions and build their byte index. */
      const generationRoot = getAudioGenerationRoot(trackId, sourceFileName)
      const cmafPackage = await generateCmaf(generationRoot, job, temporaryRoot, bitrates)
      await job.updateProgress(PROGRESS.cmafReady)

      /** Phase 4: upload the progressive fallback, HLS package and CMAF renditions. */
      await uploadArtifacts({
        storage: this.storage,
        generationRoot,
        variants,
        temporaryHlsPath,
        cmafPackage,
      })
      await job.updateProgress(PROGRESS.uploaded)

      if (!(await this.isStillCurrent(job))) {
        await this.storage.deletePrefix(generationRoot)
        this.logger.warn(`Removed stale uploaded generation from job ${job.id}`)
        return
      }

      /** Phase 5: persist TrackFile records + mark READY. */
      await publishTrackFiles({
        prisma: this.prisma,
        trackId,
        sourceFileName,
        format,
        variants,
        cmafPackage,
      })

      await job.updateProgress(PROGRESS.done)
      this.logger.log(
        `Audio conversion + storage upload completed for track ${trackId}, job ${job.id}`,
      )
    } catch (error) {
      if (error instanceof StaleAudioJobError) {
        await this.storage.deletePrefix(getAudioGenerationRoot(trackId, sourceFileName))
        this.logger.warn(`Discarded superseded audio generation from job ${job.id}`)
        return
      }

      await this.markAttemptFailed(
        job,
        error instanceof Error ? error.message : 'Unknown conversion error',
      )
      throw error
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true })
    }
  }

  /** Runs the on failed operation. */
  @OnWorkerEvent('failed')
  async onFailed(job: Job<ConvertAudioJob> | undefined, error: Error) {
    if (job?.name !== 'convert-audio') return

    const maxAttempts = job.opts.attempts ?? 1
    if (job.attemptsMade < maxAttempts) return

    const failed = await this.prisma.track.updateMany({
      where: { id: job.data.trackId, audioUrl: job.data.sourceFileName },
      data: {
        processingStatus: 'FAILED',
        processingError: error.message,
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
      jobId: `failed-${String(job.id)}-${job.attemptsMade}`,
      removeOnComplete: 500,
      removeOnFail: 1_000,
    })
    this.logger.error(
      `Audio conversion permanently failed for track ${job.data.trackId}`,
      error.stack,
    )
  }

  /** Runs the on stalled operation. */
  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`Audio conversion job ${jobId} stalled and will be recovered by BullMQ`)
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
