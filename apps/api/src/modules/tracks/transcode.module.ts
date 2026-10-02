import {
  AUDIO_PROCESSING_DEAD_LETTER_QUEUE,
  AUDIO_PROCESSING_QUEUE,
} from '@infra/queues/audio-processing.queue'
import { StorageCoreModule } from '@infra/storage/storage-core.module'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { AudioProcessingConsumer } from './audio-processing.consumer'
import { ProcessingAttemptRecorder } from './processing-attempt.recorder'

/**
 * The audio-conversion pipeline: the consumer, the attempt recorder and both queue
 * registrations. Shared by the API's `TracksModule` (the producer, which enqueues and records
 * enqueue failures) and the standalone worker, so the queues and the recorder have one owner.
 *
 * Whether the consumer actually runs a BullMQ worker is decided per process by
 * `AUDIO_PROCESSING_WORKER_ENABLED`. Deliberately has no auth imports so a process without HTTP
 * can load it. Needs `PrismaModule` (global) and the root `ConfigModule` / `BullModule`. See
 * ADR-0049.
 */
@Module({
  imports: [
    StorageCoreModule,
    BullModule.registerQueue(
      { name: AUDIO_PROCESSING_QUEUE },
      {
        name: AUDIO_PROCESSING_DEAD_LETTER_QUEUE,
        defaultJobOptions: { removeOnComplete: 500, removeOnFail: 1_000 },
      },
    ),
  ],
  providers: [AudioProcessingConsumer, ProcessingAttemptRecorder],
  exports: [ProcessingAttemptRecorder, BullModule],
})
export class TranscodeModule {}
