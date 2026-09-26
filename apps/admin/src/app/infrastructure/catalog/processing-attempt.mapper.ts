import type {
  ProcessingAttempt,
  ProcessingAttemptStatus,
  ProcessingAttemptTrigger,
  ProcessingErrorCode,
  ProcessingStep,
} from '@domain/track'
import type {
  ProcessingAttemptDto,
  WireProcessingAttemptStatus,
  WireProcessingAttemptTrigger,
  WireProcessingErrorCode,
  WireProcessingStep,
} from './processing-attempt.dto'

/**
 * The same join `track.mapper.ts` does for `TrackProcessingStatus` — spelled out so a member the
 * API grows later fails to compile here rather than throwing inside `parse` in front of an
 * operator.
 */
const TO_DOMAIN_TRIGGER = {
  UPLOAD: 'UPLOAD',
  REPLACE: 'REPLACE',
  REPROCESS: 'REPROCESS',
} as const satisfies Record<WireProcessingAttemptTrigger, ProcessingAttemptTrigger>

const TO_DOMAIN_STATUS = {
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  SUPERSEDED: 'SUPERSEDED',
  STALLED: 'STALLED',
} as const satisfies Record<WireProcessingAttemptStatus, ProcessingAttemptStatus>

const TO_DOMAIN_STEP = {
  CLAIM: 'CLAIM',
  PREPARE_TEMP: 'PREPARE_TEMP',
  PROGRESSIVE_ENCODE: 'PROGRESSIVE_ENCODE',
  HLS_ENCODE: 'HLS_ENCODE',
  HLS_VALIDATE: 'HLS_VALIDATE',
  CMAF_ENCODE: 'CMAF_ENCODE',
  UPLOAD: 'UPLOAD',
  PUBLISH: 'PUBLISH',
  CLEANUP: 'CLEANUP',
} as const satisfies Record<WireProcessingStep, ProcessingStep>

const TO_DOMAIN_ERROR_CODE = {
  FFMPEG_EXIT: 'FFMPEG_EXIT',
  FFMPEG_SIGNAL: 'FFMPEG_SIGNAL',
  TIMEOUT: 'TIMEOUT',
  INVALID_INPUT: 'INVALID_INPUT',
  EMPTY_OUTPUT: 'EMPTY_OUTPUT',
  STORAGE: 'STORAGE',
  DATABASE: 'DATABASE',
  STALLED: 'STALLED',
  UNKNOWN: 'UNKNOWN',
} as const satisfies Record<WireProcessingErrorCode, ProcessingErrorCode>

export function toProcessingAttempt(dto: ProcessingAttemptDto): ProcessingAttempt {
  return {
    id: dto.id,
    trackId: dto.trackId,
    sourceFileName: dto.sourceFileName,
    jobId: dto.jobId,
    attempt: dto.attempt,
    maxAttempts: dto.maxAttempts,
    trigger: TO_DOMAIN_TRIGGER[dto.trigger],
    status: TO_DOMAIN_STATUS[dto.status],
    willRetry: dto.willRetry,
    deadLetterJobId: dto.deadLetterJobId ?? null,
    startedAt: new Date(dto.startedAt),
    finishedAt: dto.finishedAt == null ? null : new Date(dto.finishedAt),
    durationMs: dto.durationMs ?? null,
    lastProgress: dto.lastProgress,
    failedStep: dto.failedStep == null ? null : TO_DOMAIN_STEP[dto.failedStep],
    stepDetail: dto.stepDetail ?? null,
    errorCode: dto.errorCode == null ? null : TO_DOMAIN_ERROR_CODE[dto.errorCode],
    errorName: dto.errorName ?? null,
    errorMessage: dto.errorMessage ?? null,
    errorStack: dto.errorStack ?? null,
    retryable: dto.retryable ?? null,
    commandSummary: dto.commandSummary ?? null,
    stderrTail: dto.stderrTail ?? null,
    exitCode: dto.exitCode ?? null,
    signal: dto.signal ?? null,
    inputBytes: dto.inputBytes ?? null,
    inputCodec: dto.inputCodec ?? null,
    inputContainer: dto.inputContainer ?? null,
    inputBitrateKbps: dto.inputBitrateKbps ?? null,
    inputDurationSec: dto.inputDurationSec ?? null,
    workerHost: dto.workerHost,
    workerPid: dto.workerPid,
    workerRelease: dto.workerRelease ?? null,
    createdAt: new Date(dto.createdAt),
  }
}
