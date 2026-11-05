import { StorageCoreModule } from '@infra/storage/storage-core.module'
import { NotificationsQueueModule } from '@modules/notifications'
import { Module } from '@nestjs/common'
import { AudioProcessingConsumer } from './audio-processing.consumer'
import { AudioProcessingQueueModule } from './audio-processing-queue.module'

/**
 * The audio-conversion pipeline: the consumer on top of the queues and the attempt recorder
 * (`AudioProcessingQueueModule`). Shared by the API's `TracksModule` (the producer, which enqueues
 * and records enqueue failures) and the standalone worker, so the queues and the recorder have
 * one owner.
 *
 * Whether the consumer actually runs a BullMQ worker is decided per process by
 * `AUDIO_PROCESSING_WORKER_ENABLED`. Deliberately has no auth imports so a process without HTTP
 * can load it. Needs `PrismaModule` (global) and the root `ConfigModule` / `BullModule`. See
 * ADR-0049.
 */
@Module({
  imports: [StorageCoreModule, NotificationsQueueModule, AudioProcessingQueueModule],
  providers: [AudioProcessingConsumer],
  exports: [AudioProcessingQueueModule, AudioProcessingConsumer],
})
export class TranscodeModule {}
