import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { type Job, UnrecoverableError } from 'bullmq'
import {
  NOTIFICATION_JOBS,
  NOTIFICATIONS_QUEUE,
  parseFollowJob,
  parseNewReleaseJob,
} from './notifications.queue'
import { NotificationsService } from './notifications.service'

/** Turns follow and release events into notification rows (the work itself is idempotent). */
@Injectable()
@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsConsumer extends WorkerHost {
  private readonly logger = new Logger(NotificationsConsumer.name)

  constructor(
    /* explicit token: a consumer file may import the class as a type, which DI cannot resolve */
    @Inject(NotificationsService) private readonly notifications: NotificationsService,
  ) {
    super()
  }

  async process(job: Job) {
    switch (job.name) {
      case NOTIFICATION_JOBS.FOLLOW: {
        const parsed = parseFollowJob(job.data)
        if (!parsed.success) throw new UnrecoverableError(`Malformed ${job.name} job ${job.id}`)
        await this.notifications.notifyFollow(parsed.data)
        return
      }
      case NOTIFICATION_JOBS.NEW_RELEASE: {
        const parsed = parseNewReleaseJob(job.data)
        if (!parsed.success) throw new UnrecoverableError(`Malformed ${job.name} job ${job.id}`)
        await this.notifications.notifyNewRelease(parsed.data)
        return
      }
      default:
        this.logger.warn(`Ignoring unknown notifications job ${job.name}`)
    }
  }
}
