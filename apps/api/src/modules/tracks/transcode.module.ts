import { StorageCoreModule } from '@infra/storage/storage-core.module'
import { NotificationsQueueModule } from '@modules/notifications'
import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { AudioProcessingConsumer } from './audio-processing.consumer'
import { AudioProcessingQueueModule } from './audio-processing-queue.module'
import { STUCK_TRACKS_QUEUE, StuckTracksConsumer } from './stuck-tracks.consumer'
import { StuckTrackSweeper } from './stuck-tracks.sweeper'

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
 *
 * Also owns the sweep that fails tracks stuck in PROCESSING with no live conversion; it runs
 * under the same switch, so only the converting process schedules it.
 */
@Module({
  imports: [
    StorageCoreModule,
    NotificationsQueueModule,
    AudioProcessingQueueModule,
    BullModule.registerQueue({ name: STUCK_TRACKS_QUEUE }),
  ],
  providers: [AudioProcessingConsumer, StuckTrackSweeper, StuckTracksConsumer],
  exports: [AudioProcessingQueueModule, AudioProcessingConsumer],
})
export class TranscodeModule {}
