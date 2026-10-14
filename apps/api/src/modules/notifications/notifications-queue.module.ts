import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { NotificationsProducer } from './notifications.producer'
import { NOTIFICATIONS_QUEUE } from './notifications.queue'

/**
 * The notifications queue and its producer only — no consumer, no auth — so the standalone
 * transcode worker can enqueue release notifications without loading the API's graph.
 */
@Module({
  imports: [BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE })],
  providers: [NotificationsProducer],
  exports: [NotificationsProducer, BullModule],
})
export class NotificationsQueueModule {}
