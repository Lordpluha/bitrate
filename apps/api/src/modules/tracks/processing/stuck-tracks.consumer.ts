import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger, type OnModuleInit } from '@nestjs/common'
import type { Job, Queue } from 'bullmq'
import { isAudioProcessingWorkerAutorunEnabled } from './audio-processing.worker-autorun'
import { StuckTrackSweeper } from './stuck-tracks.sweeper'

export const STUCK_TRACKS_QUEUE = 'stuck-tracks'
export const STUCK_TRACKS_JOB = 'sweep'
export const STUCK_TRACKS_SCHEDULER_ID = 'stuck-tracks-sweep'
/** How often tracks stuck in PROCESSING are looked for. */
export const STUCK_TRACKS_SWEEP_EVERY_MS = 10 * 60 * 1000

/**
 * Runs {@link StuckTrackSweeper} on a schedule. The scheduler is an upsert, so restarts keep a
 * single schedule, and it follows the same switch as the transcode consumer: only the process
 * that converts audio (the worker in production) sweeps, so the API and the operator process
 * never race it. The sweep is idempotent, so a duplicated run is harmless.
 */
@Processor(STUCK_TRACKS_QUEUE, { autorun: isAudioProcessingWorkerAutorunEnabled() })
export class StuckTracksConsumer extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(StuckTracksConsumer.name)

  constructor(
    private readonly sweeper: StuckTrackSweeper,
    @InjectQueue(STUCK_TRACKS_QUEUE) private readonly queue: Queue,
  ) {
    super()
  }

  async onModuleInit() {
    if (!isAudioProcessingWorkerAutorunEnabled()) return
    await this.queue.upsertJobScheduler(
      STUCK_TRACKS_SCHEDULER_ID,
      { every: STUCK_TRACKS_SWEEP_EVERY_MS },
      { name: STUCK_TRACKS_JOB, opts: { removeOnComplete: 100, removeOnFail: 500 } },
    )
  }

  async process(job: Job) {
    if (job.name !== STUCK_TRACKS_JOB) {
      this.logger.warn(`Ignoring unknown stuck-tracks job ${job.name}`)
      return
    }
    await this.sweeper.sweep()
  }
}
