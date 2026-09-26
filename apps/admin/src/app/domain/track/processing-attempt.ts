import { STUCK_AFTER_MS } from './track'

/** Rows per page for the processing-history section — smaller than a list screen's default. */
export const PROCESSING_ATTEMPTS_PAGE_SIZE = 10

/**
 * Declared here rather than imported from `@bitrate/contracts` — see `TrackProcessingStatus` in
 * `track.ts` for why. `infrastructure/catalog/processing-attempt.mapper.ts` binds each of these
 * to the generated contract through an exhaustive record.
 */
export type ProcessingAttemptTrigger = 'UPLOAD' | 'REPLACE' | 'REPROCESS'

export type ProcessingAttemptStatus = 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'SUPERSEDED' | 'STALLED'

export type ProcessingStep =
  | 'CLAIM'
  | 'PREPARE_TEMP'
  | 'PROGRESSIVE_ENCODE'
  | 'HLS_ENCODE'
  | 'HLS_VALIDATE'
  | 'CMAF_ENCODE'
  | 'UPLOAD'
  | 'PUBLISH'
  | 'CLEANUP'

export type ProcessingErrorCode =
  | 'FFMPEG_EXIT'
  | 'FFMPEG_SIGNAL'
  | 'TIMEOUT'
  | 'INVALID_INPUT'
  | 'EMPTY_OUTPUT'
  | 'STORAGE'
  | 'DATABASE'
  | 'STALLED'
  | 'UNKNOWN'

/** One BullMQ attempt at processing one generation of a track's source file. */
export type ProcessingAttempt = {
  id: string
  trackId: string
  sourceFileName: string
  jobId: string
  attempt: number
  maxAttempts: number
  trigger: ProcessingAttemptTrigger
  status: ProcessingAttemptStatus
  /** This attempt failed and BullMQ will try again — never rendered as a promise, see `retryable`. */
  willRetry: boolean
  deadLetterJobId: string | null
  startedAt: Date
  finishedAt: Date | null
  durationMs: number | null
  lastProgress: number
  failedStep: ProcessingStep | null
  stepDetail: string | null
  errorCode: ProcessingErrorCode | null
  errorName: string | null
  errorMessage: string | null
  errorStack: string | null
  /** Advisory classification of whether the error is believed transient. Not a retry promise. */
  retryable: boolean | null
  commandSummary: string | null
  stderrTail: string | null
  exitCode: number | null
  signal: string | null
  inputBytes: number | null
  inputCodec: string | null
  inputContainer: string | null
  inputBitrateKbps: number | null
  inputDurationSec: number | null
  workerHost: string
  workerPid: number
  workerRelease: string | null
  createdAt: Date
}

const OUTCOME_LABEL: Record<ProcessingAttemptStatus, string> = {
  RUNNING: 'Running',
  SUCCEEDED: 'Succeeded',
  FAILED: 'Failed',
  SUPERSEDED: 'Superseded',
  STALLED: 'Stalled',
}

/** The operator-facing word for an attempt's outcome. */
export function attemptOutcomeLabel(attempt: ProcessingAttempt): string {
  return OUTCOME_LABEL[attempt.status]
}

/** Whether this attempt carries anything worth a diagnostics disclosure. */
export function hasDiagnostics(attempt: ProcessingAttempt): boolean {
  return (
    attempt.commandSummary !== null ||
    attempt.stderrTail !== null ||
    attempt.errorStack !== null ||
    attempt.errorMessage !== null
  )
}

type IsAttemptRunningTooLongInput = {
  attempt: ProcessingAttempt
  /** Injectable so the rule is testable without freezing the clock. */
  now?: Date
}

/** A RUNNING attempt that has been going on long enough to be worth flagging — mirrors `isTrackStuck`. */
export function isAttemptRunningTooLong({
  attempt,
  now = new Date(),
}: IsAttemptRunningTooLongInput): boolean {
  if (attempt.status !== 'RUNNING') return false

  return now.getTime() - attempt.startedAt.getTime() > STUCK_AFTER_MS
}
