import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import type { Job, Queue } from 'bullmq'
import { PlaybackEventsService } from './playback-events.service'

export const PLAYBACK_EVENTS_RETENTION_QUEUE = 'playback-events-retention'
export const PLAYBACK_EVENTS_RETENTION_JOB = 'remove-expired'
export const PLAYBACK_EVENTS_RETENTION_SCHEDULER_ID = 'playback-events-retention-daily'
/** Daily is plenty for a 13-month window; a missed run only delays removal by a day. */
export const PLAYBACK_EVENTS_RETENTION_EVERY_MS = 24 * 60 * 60 * 1000

/**
 * Removes playback events past their retention window on a schedule. One job scheduler (an
 * upsert, so restarts and several API instances keep a single schedule) enqueues the job; the
 * work is idempotent, so a retried or duplicated run is harmless.
 */
@Injectable()
@Processor(PLAYBACK_EVENTS_RETENTION_QUEUE)
export class PlaybackEventsRetentionConsumer extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(PlaybackEventsRetentionConsumer.name)

  constructor(
    private readonly events: PlaybackEventsService,
    @InjectQueue(PLAYBACK_EVENTS_RETENTION_QUEUE) private readonly queue: Queue,
  ) {
    super()
  }

  async onModuleInit() {
    await this.queue.upsertJobScheduler(
      PLAYBACK_EVENTS_RETENTION_SCHEDULER_ID,
      { every: PLAYBACK_EVENTS_RETENTION_EVERY_MS },
      { name: PLAYBACK_EVENTS_RETENTION_JOB, opts: { removeOnComplete: 30, removeOnFail: 100 } },
    )
  }

  async process(job: Job) {
    if (job.name !== PLAYBACK_EVENTS_RETENTION_JOB) {
      this.logger.warn(`Ignoring unknown playback-events-retention job ${job.name}`)
      return
    }
    const removed = await this.events.removeExpired()
    if (removed > 0) this.logger.log(`Removed ${removed} expired playback events`)
  }
}
