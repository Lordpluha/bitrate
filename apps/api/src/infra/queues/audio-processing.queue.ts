import type { TrackProcessingTrigger } from '@prisma/client'

/** BullMQ queue names used by the audio-processing pipeline. */
export const AUDIO_PROCESSING_QUEUE = 'audio-processing'
export const AUDIO_PROCESSING_DEAD_LETTER_QUEUE = 'audio-processing-dead-letter'

/** Retry and retention policy for audio conversion jobs. */
export const AUDIO_PROCESSING_JOB_OPTIONS = {
  attempts: 5,
  backoff: { type: 'exponential' as const, delay: 5_000 },
  removeOnComplete: { age: 3_600, count: 1_000 },
  removeOnFail: { age: 604_800, count: 5_000 },
}

/**
 * Audio metadata captured at enqueue time (already probed for bitrate selection), carried
 * on the job so the worker never re-probes the source file itself.
 */
export type ConvertAudioJobInputProbe = {
  bytes: number
  codec: string | null
  container: string | null
  bitrateKbps: number
  durationSec: number | null
}

/**
 * Data required to convert and publish one track.
 *
 * `trigger` and `input` are optional so a job already sitting in Redis when this field was
 * added still deserializes and processes — the consumer defaults a missing `trigger` to
 * `UPLOAD` and simply skips the input-probe columns when `input` is absent.
 */
export interface ConvertAudioJob {
  trackId: string
  artistId: string
  sourceFileName: string
  inputPath: string
  outputDir: string
  format: string
  bitrates: string[]
  trigger?: TrackProcessingTrigger
  input?: ConvertAudioJobInputProbe
}
