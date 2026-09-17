import type { ConvertAudioJobInputProbe } from '@infra/queues/audio-processing.queue'
import type { TrackProcessingStep, TrackProcessingTrigger } from '@prisma/client'

/** Input to {@link ProcessingAttemptRecorder.start}. */
export type StartProcessingAttemptInput = {
  trackId: string
  sourceFileName: string
  jobId: string
  attempt: number
  maxAttempts: number
  trigger: TrackProcessingTrigger
  input?: ConvertAudioJobInputProbe
}

/** Input to {@link ProcessingAttemptRecorder.succeed}. */
export type SucceedProcessingAttemptInput = {
  trackId: string
  jobId: string
  attempt: number
}

/** Input to {@link ProcessingAttemptRecorder.supersede}. */
export type SupersedeProcessingAttemptInput = {
  trackId: string
  jobId: string
  attempt: number
  step: TrackProcessingStep
}

/** Input to {@link ProcessingAttemptRecorder.fail}. */
export type FailProcessingAttemptInput = {
  trackId: string
  jobId: string
  attempt: number
  step: TrackProcessingStep
  stepDetail?: string
  error: unknown
  willRetry: boolean
}

/** Input to {@link ProcessingAttemptRecorder.finalize}. */
export type FinalizeProcessingAttemptInput = {
  trackId: string
  sourceFileName: string
  jobId: string
  attempt: number
  deadLetterJobId: string
  error: Error
}

/** Input to {@link ProcessingAttemptRecorder.recordEnqueueFailure}. */
export type RecordEnqueueFailureInput = {
  trackId: string
  sourceFileName: string
  jobId: string
  trigger: TrackProcessingTrigger
  error: unknown
}
