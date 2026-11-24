import { PrismaService } from '@infra/prisma/prisma.service'
import {
  SUPPORT_RETENTION_EVERY_MS,
  SUPPORT_RETENTION_JOB,
  SUPPORT_RETENTION_QUEUE,
  SUPPORT_RETENTION_SCHEDULER_ID,
} from '@infra/queues/support-retention.queue'
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common'
import type { Job, Queue } from 'bullmq'
import { purgeExpiredConversations } from './purge-expired-conversations'

/** Purges expired support conversations on a schedule (an upsert: one schedule per cluster). */
@Injectable()
@Processor(SUPPORT_RETENTION_QUEUE)
export class SupportRetentionConsumer extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(SupportRetentionConsumer.name)

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(SUPPORT_RETENTION_QUEUE) private readonly queue: Queue,
  ) {
    super()
  }

  async onModuleInit() {
    await this.queue.upsertJobScheduler(
      SUPPORT_RETENTION_SCHEDULER_ID,
      { every: SUPPORT_RETENTION_EVERY_MS },
      { name: SUPPORT_RETENTION_JOB, opts: { removeOnComplete: 100, removeOnFail: 500 } },
    )
  }

  async process(job: Job) {
    if (job.name !== SUPPORT_RETENTION_JOB) {
      this.logger.warn(`Ignoring unknown support-retention job ${job.name}`)
      return
    }
    const deleted = await purgeExpiredConversations(this.prisma)
    if (deleted > 0) this.logger.log(`Deleted ${deleted} expired support conversations`)
  }
}
