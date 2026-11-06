// biome-ignore lint/style/useImportType: constructor-injected — NestJS DI needs the real class reference at runtime, not a type-only import.
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  AUDIO_PROCESSING_JOB_OPTIONS,
  AUDIO_PROCESSING_QUEUE,
  audioConversionJobId,
  type ConvertAudioJobInputProbe,
  LIVE_AUDIO_JOB_STATES,
} from '@infra/queues/audio-processing.queue'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import type { TrackProcessingTrigger } from '@prisma/client'
import type { Queue } from 'bullmq'
import { getMasterKey } from '../shared/audio-storage-keys'
import type { AudioMetadata } from '../shared/track-media'
// biome-ignore lint/style/useImportType: constructor-injected — NestJS DI needs the real class reference at runtime, not a type-only import.
import { ProcessingAttemptRecorder } from './processing-attempt.recorder'

/** Everything an audio-conversion job needs to transcode one stored master. */
export type EnqueueConversionInput = {
  trackId: string
  artistId: string
  sourceFileName: string
  bitrates: string[]
  trigger: TrackProcessingTrigger
  input: ConvertAudioJobInputProbe
}

/** Builds the job's input probe from a metadata read plus the source file's byte size. */
export function toInputProbe(metadata: AudioMetadata, bytes: number): ConvertAudioJobInputProbe {
  return {
    bytes,
    codec: metadata.codec,
    container: metadata.container,
    bitrateKbps: metadata.bitrate,
    durationSec: metadata.duration,
  }
}

/**
 * The producer side of the audio-conversion queue: the one place that adds `convert-audio`
 * jobs. Needs only Prisma, the queue and the attempt recorder, so it lives beside the consumer
 * without pulling HTTP, cache or auth into the worker (ADR-0049).
 */
@Injectable()
export class AudioConversionProducer {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(AUDIO_PROCESSING_QUEUE) private readonly audioQueue: Queue,
    private readonly recorder: ProcessingAttemptRecorder,
  ) {}

  /** Queues an audio-conversion job, marking the track FAILED if it cannot be enqueued. */
  async enqueue({
    trackId,
    artistId,
    sourceFileName,
    bitrates,
    trigger,
    input,
  }: EnqueueConversionInput) {
    const jobId = audioConversionJobId(trackId, sourceFileName)
    try {
      await this.clearFinishedJob(jobId)
      await this.audioQueue.add(
        'convert-audio',
        {
          trackId,
          artistId,
          sourceFileName,
          masterKey: getMasterKey(sourceFileName),
          bitrates,
          trigger,
          input,
        },
        { ...AUDIO_PROCESSING_JOB_OPTIONS, jobId },
      )
    } catch (error) {
      await this.prisma.track.update({
        where: { id: trackId },
        data: {
          processingStatus: 'FAILED',
          processingError: error instanceof Error ? error.message : 'Unable to enqueue conversion',
          processingFinishedAt: new Date(),
        },
      })
      await this.recorder.recordEnqueueFailure({ trackId, sourceFileName, jobId, trigger, error })
      throw error
    }
  }

  /**
   * Removes a finished job that still holds this id, so the next `add` really queues one.
   *
   * The id is deterministic per source file, and BullMQ answers `add` for an id it still
   * stores by returning the old job without queueing anything -- a failed job is kept for
   * days. A reprocess or a release retry then flipped the track to PROCESSING with nothing
   * queued, and it stayed there. A job that is still waiting or running is kept: it will
   * convert the same source, and replacing it would only race it.
   */
  private async clearFinishedJob(jobId: string) {
    const existing = await this.audioQueue.getJob(jobId)
    if (!existing) return
    if (LIVE_AUDIO_JOB_STATES.has(await existing.getState())) return
    await existing.remove()
  }
}
