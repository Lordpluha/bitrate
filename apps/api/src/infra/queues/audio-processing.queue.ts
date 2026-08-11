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

/** Data required to convert and publish one track. */
export interface ConvertAudioJob {
  trackId: string
  artistId: string
  sourceFileName: string
  inputPath: string
  outputDir: string
  format: string
  bitrates: string[]
}
