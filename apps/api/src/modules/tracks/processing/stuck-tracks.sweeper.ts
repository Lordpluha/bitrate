// biome-ignore lint/style/useImportType: constructor-injected — NestJS DI needs the real class reference at runtime, not a type-only import.
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  AUDIO_PROCESSING_QUEUE,
  audioConversionJobId,
  LIVE_AUDIO_JOB_STATES,
} from '@infra/queues/audio-processing.queue'
import {
  RELEASE_PUBLISHING_JOB_OPTIONS,
  RELEASE_PUBLISHING_JOBS,
  RELEASE_PUBLISHING_QUEUE,
  type ReleaseTrackSettledJob,
} from '@infra/queues/release-publishing.queue'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import * as Sentry from '@sentry/nestjs'
import type { Queue } from 'bullmq'
import { errorMessageOf } from './processing-log/classify'

/**
 * How long a track may sit in PROCESSING before the sweep looks at it. A conversion that is
 * really running takes at most about an hour (five attempts, each capped by the 600 s ffmpeg
 * timeout, plus backoff), and a live job is left alone at any age anyway: this is only the
 * grace period before a track with no job at all is called stuck.
 */
export const STUCK_PROCESSING_AFTER_MS = 90 * 60 * 1000

/** At most this many tracks per sweep, so one run stays short; the next run takes the rest. */
const SWEEP_BATCH_SIZE = 100

/** What an artist and an operator see on a track the sweep gave up on. */
const STUCK_PROCESSING_ERROR =
  'Processing stopped without a result. Retry the track to convert it again.'

/** One candidate the sweep inspects. */
type ProcessingTrack = { id: string; audioUrl: string }

/**
 * Fails tracks left in PROCESSING with no conversion that will ever finish them.
 *
 * Nothing else does: a job BullMQ fails outside the normal retry path, an enqueue BullMQ
 * silently ignored, or a release publish that died before queueing its conversions all leave
 * the track spinning forever, and its release stuck in PUBLISHING. FAILED is the honest state:
 * the artist sees the error and retries; the sweep never re-enqueues by itself.
 */
@Injectable()
export class StuckTrackSweeper {
  private readonly logger = new Logger(StuckTrackSweeper.name, { timestamp: true })

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(AUDIO_PROCESSING_QUEUE) private readonly audioQueue: Queue,
    @InjectQueue(RELEASE_PUBLISHING_QUEUE)
    private readonly releasePublishing: Queue<ReleaseTrackSettledJob>,
  ) {}

  /** Fails every stuck track found now; returns how many it failed. */
  async sweep(now: Date = new Date()): Promise<number> {
    const cutoff = new Date(now.getTime() - STUCK_PROCESSING_AFTER_MS)
    const candidates: ProcessingTrack[] = await this.prisma.track.findMany({
      where: { processingStatus: 'PROCESSING', updatedAt: { lt: cutoff } },
      select: { id: true, audioUrl: true },
      orderBy: { updatedAt: 'asc' },
      take: SWEEP_BATCH_SIZE,
    })

    let failed = 0
    for (const track of candidates) {
      try {
        if (await this.failIfStuck(track, cutoff, now)) failed += 1
      } catch (error) {
        // One unreachable job or row must not shield the rest of the batch.
        this.logger.error(`Could not sweep track ${track.id}: ${errorMessageOf(error)}`)
      }
    }
    if (failed > 0) this.logger.warn(`Failed ${failed} track(s) stuck in PROCESSING`)
    return failed
  }

  /** Fails one candidate unless its conversion job is still going to run. */
  private async failIfStuck(track: ProcessingTrack, cutoff: Date, now: Date): Promise<boolean> {
    const job = await this.audioQueue.getJob(audioConversionJobId(track.id, track.audioUrl))
    if (job && LIVE_AUDIO_JOB_STATES.has(await job.getState())) return false

    // Conditional on everything read above, so an upload, retry or finished conversion that
    // landed in between wins over the sweep.
    const updated = await this.prisma.track.updateMany({
      where: {
        id: track.id,
        audioUrl: track.audioUrl,
        processingStatus: 'PROCESSING',
        updatedAt: { lt: cutoff },
      },
      data: {
        processingStatus: 'FAILED',
        processingError: STUCK_PROCESSING_ERROR,
        processingFinishedAt: now,
      },
    })
    if (updated.count !== 1) return false

    this.logger.warn(`Track ${track.id} was stuck in PROCESSING with no live conversion; failed it`)
    Sentry.captureException(new Error('Track stuck in PROCESSING with no live conversion job'), {
      tags: { trackId: track.id },
      fingerprint: ['audio-processing', 'STUCK'],
    })
    await this.settleRelease(track.id)
    return true
  }

  /** Lets a release waiting on this track decide it is done, as a failed conversion does. */
  private async settleRelease(trackId: string) {
    const link = await this.prisma.releaseTrack.findFirst({
      where: { trackId },
      select: { releaseId: true },
    })
    if (!link) return
    await this.releasePublishing.add(
      RELEASE_PUBLISHING_JOBS.TRACK_SETTLED,
      { trackId },
      { ...RELEASE_PUBLISHING_JOB_OPTIONS, jobId: `track-settled-${trackId}-${Date.now()}` },
    )
  }
}
