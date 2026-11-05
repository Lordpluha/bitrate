import {
  AUDIO_PROCESSING_DEAD_LETTER_QUEUE,
  AUDIO_PROCESSING_QUEUE,
} from '@infra/queues/audio-processing.queue'
import { RELEASE_PUBLISHING_QUEUE } from '@infra/queues/release-publishing.queue'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ProcessingAttemptRecorder } from './processing-attempt.recorder'

/**
 * The audio-conversion queues and the attempt recorder, without the consumer: what a producer
 * needs. `TranscodeModule` adds the consumer on top; the operator process imports only this, so
 * it never runs a conversion worker (#458).
 */
@Module({
  imports: [
    BullModule.registerQueue(
      { name: AUDIO_PROCESSING_QUEUE },
      {
        name: AUDIO_PROCESSING_DEAD_LETTER_QUEUE,
        defaultJobOptions: { removeOnComplete: 500, removeOnFail: 1_000 },
      },
      // Producer only: finished conversions of release tracks are reported to the API.
      { name: RELEASE_PUBLISHING_QUEUE },
    ),
  ],
  providers: [ProcessingAttemptRecorder],
  exports: [ProcessingAttemptRecorder, BullModule],
})
export class AudioProcessingQueueModule {}
