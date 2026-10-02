import type { TrackProcessingTrigger } from '@prisma/client'
import { z } from 'zod'

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
 * The master is named by its object key in STORAGE_SERVICE, never by a filesystem path, so a
 * worker on another host (sharing no disk with the API) can fetch it. `trigger` and `input` are
 * optional so a job without them still deserializes — the consumer defaults a missing `trigger`
 * to `UPLOAD` and skips the input-probe columns when `input` is absent.
 */
export interface ConvertAudioJob {
  trackId: string
  artistId: string
  sourceFileName: string
  masterKey: string
  format: string
  bitrates: string[]
  trigger?: TrackProcessingTrigger
  input?: ConvertAudioJobInputProbe
}

/** A relative object key: no leading slash, no traversal, no backslashes. */
const objectKeySchema = z
  .string()
  .min(1)
  .refine((key) => !(key.startsWith('/') || key.includes('\\') || key.split('/').includes('..')), {
    message: 'must be a relative object key',
  })

const convertAudioJobSchema = z.object({
  trackId: z.string().min(1),
  artistId: z.string().min(1),
  sourceFileName: z.string().min(1),
  masterKey: objectKeySchema,
  format: z.string().min(1),
  bitrates: z.array(z.string().regex(/^\d+k$/)).min(1),
  trigger: z.enum(['UPLOAD', 'REPLACE', 'REPROCESS']).optional(),
  input: z
    .object({
      bytes: z.number(),
      codec: z.string().nullable(),
      container: z.string().nullable(),
      bitrateKbps: z.number(),
      durationSec: z.number().nullable(),
    })
    .optional(),
})

/** Outcome of validating a raw job payload. */
export type ParsedConvertAudioJob =
  | { success: true; data: ConvertAudioJob }
  | { success: false; reason: string }

/** Validates a raw `convert-audio` payload; an unrecognised one carries a human-readable reason. */
export function parseConvertAudioJob(data: unknown): ParsedConvertAudioJob {
  const result = convertAudioJobSchema.safeParse(data)
  if (result.success) return { success: true, data: result.data }
  return {
    success: false,
    reason: result.error.issues
      .map((issue) => `${issue.path.join('.') || '(payload)'}: ${issue.message}`)
      .join('; '),
  }
}

/** Dead-letter entry for a payload the consumer does not recognise. */
export type UnrecognisedAudioJob = {
  reason: string
  originalJobId: string | undefined
  payload: unknown
}
