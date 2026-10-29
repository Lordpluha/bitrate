import {
  parseReleasePublishJob,
  parseReleaseTrackSettledJob,
  RELEASE_PUBLISHING_JOBS,
  RELEASE_PUBLISHING_QUEUE,
} from '@infra/queues/release-publishing.queue'
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { type Job, UnrecoverableError } from 'bullmq'
import { ReleasePublishingService } from './release-publishing.service'

/** Runs publish jobs and reacts to finished conversions of release tracks. */
@Injectable()
@Processor(RELEASE_PUBLISHING_QUEUE)
export class ReleasePublishingConsumer extends WorkerHost {
  private readonly logger = new Logger(ReleasePublishingConsumer.name)

  constructor(private readonly publishing: ReleasePublishingService) {
    super()
  }

  async process(job: Job) {
    switch (job.name) {
      case RELEASE_PUBLISHING_JOBS.PUBLISH: {
        const parsed = parseReleasePublishJob(job.data)
        if (!parsed.success) throw new UnrecoverableError(`Malformed ${job.name} job ${job.id}`)
        await this.publishing.materialize(parsed.data.releaseId)
        return
      }
      case RELEASE_PUBLISHING_JOBS.TRACK_SETTLED: {
        const parsed = parseReleaseTrackSettledJob(job.data)
        if (!parsed.success) throw new UnrecoverableError(`Malformed ${job.name} job ${job.id}`)
        await this.publishing.trackSettled(parsed.data.trackId)
        return
      }
      default:
        this.logger.warn(`Ignoring unknown release-publishing job ${job.name}`)
    }
  }

  /** A publish job that used up its attempts leaves the release PUBLISH_FAILED for a retry. */
  @OnWorkerEvent('failed')
  async onFailed(job: Job | undefined, error: Error) {
    if (job?.name !== RELEASE_PUBLISHING_JOBS.PUBLISH) return
    const finalAttempt = job.attemptsMade >= (job.opts.attempts ?? 1)
    if (!(finalAttempt || error instanceof UnrecoverableError)) return
    const parsed = parseReleasePublishJob(job.data)
    if (!parsed.success) return
    this.logger.error(`Publishing release ${parsed.data.releaseId} failed: ${error.message}`)
    await this.publishing.markFailed(parsed.data.releaseId)
  }
}
