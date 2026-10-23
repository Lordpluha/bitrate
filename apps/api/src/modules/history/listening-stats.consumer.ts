import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import type { Job, Queue } from 'bullmq'
import { ListeningStatsService } from './listening-stats.service'

export const LISTENING_STATS_QUEUE = 'listening-stats'
export const LISTENING_STATS_JOB = 'recompute'
export const LISTENING_STATS_SCHEDULER_ID = 'listening-stats-recompute'
/** How often the listening numbers are refreshed. */
export const LISTENING_STATS_EVERY_MS = 15 * 60 * 1000

/**
 * Refreshes play counts, popularity and monthly listeners on a schedule. One job scheduler (an
 * upsert, so restarts and several API instances keep a single schedule) enqueues `recompute`;
 * the work is idempotent, so a retried or duplicated run is harmless.
 */
@Injectable()
@Processor(LISTENING_STATS_QUEUE)
export class ListeningStatsConsumer extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(ListeningStatsConsumer.name)

  constructor(
    private readonly stats: ListeningStatsService,
    @InjectQueue(LISTENING_STATS_QUEUE) private readonly queue: Queue,
  ) {
    super()
  }

  async onModuleInit() {
    await this.queue.upsertJobScheduler(
      LISTENING_STATS_SCHEDULER_ID,
      { every: LISTENING_STATS_EVERY_MS },
      { name: LISTENING_STATS_JOB, opts: { removeOnComplete: 100, removeOnFail: 500 } },
    )
  }

  async process(job: Job) {
    if (job.name !== LISTENING_STATS_JOB) {
      this.logger.warn(`Ignoring unknown listening-stats job ${job.name}`)
      return
    }
    await this.stats.recompute()
  }
}
