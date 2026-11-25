import {
  SUPPORT_TELEGRAM_QUEUE,
  SUPPORT_TELEGRAM_SEND_JOB,
  SUPPORT_TELEGRAM_UPDATE_JOB,
  type TelegramSendJob,
  type TelegramUpdateJob,
} from '@infra/queues/support-telegram.queue'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import type { Job } from 'bullmq'
import { SupportTelegramService } from './support-telegram.service'
import { TelegramSender } from './telegram-sender.service'

/** Runs Telegram turns and sends replies, one job at a time, in the API process. */
@Injectable()
@Processor(SUPPORT_TELEGRAM_QUEUE)
export class SupportTelegramConsumer extends WorkerHost {
  private readonly logger = new Logger(SupportTelegramConsumer.name)

  constructor(
    private readonly telegram: SupportTelegramService,
    private readonly sender: TelegramSender,
  ) {
    super()
  }

  async process(job: Job<TelegramUpdateJob | TelegramSendJob>): Promise<void> {
    const { data } = job
    if (job.name === SUPPORT_TELEGRAM_UPDATE_JOB && 'updateId' in data) {
      return await this.telegram.handleUpdate(data)
    }
    if (job.name === SUPPORT_TELEGRAM_SEND_JOB && 'citations' in data) {
      return await this.sender.send(data)
    }
    this.logger.warn(`Ignoring unknown support-telegram job ${job.name}`)
  }
}
