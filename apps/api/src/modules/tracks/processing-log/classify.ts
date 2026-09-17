import { BadRequestException } from '@nestjs/common'
import { Prisma } from '@prisma/client'

/** Mirrors the `TrackProcessingErrorCode` Prisma enum without importing the generated type. */
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

/** What `classifyProcessingError` derives from a thrown value. */
export type ProcessingErrorClassification = {
  code: ProcessingErrorCode
  retryable: boolean
  exitCode: number | null
  signal: string | null
  stderrTail: string | null
  commandSummary: string | null
}

/** A message pattern raised when a claimed source file cannot be converted at all. */
const INVALID_INPUT_PATTERN = /invalid audio bitrate/i

/** A message pattern raised when an encoder produced no usable output. */
const EMPTY_OUTPUT_PATTERN = /converted audio file is empty|hls playlist has no/i

/** Error constructor names produced by the S3-compatible storage SDK. */
const STORAGE_ERROR_NAME_PATTERN = /^S3/

/** Filesystem errno codes that mean "the storage volume itself is the problem". */
const STORAGE_ERRNO_PATTERN = /ENOSPC|EACCES/

/**
 * The shape of `@bitrate/converter`'s `FfmpegError`, detected structurally rather than with
 * `instanceof`.
 *
 * `@bitrate/converter` is an ESM-only package (`"type": "module"`) and this file compiles to
 * CommonJS — a static value import of its class would throw `ERR_REQUIRE_ESM` the moment this
 * module loads. The rest of this module already crosses that boundary with a dynamic
 * `await import(...)`; duck-typing on `error.name` avoids needing to do that here too.
 */
type FfmpegErrorShape = {
  name: string
  timedOut: boolean
  signal: string | null
  exitCode: number | null
  stderrTail: string
  args: string[]
}

/** Whether `error` was thrown by `@bitrate/converter`'s `runFfmpeg`. */
function isFfmpegError(error: unknown): error is FfmpegErrorShape {
  return (
    error instanceof Error &&
    error.name === 'FfmpegError' &&
    'timedOut' in error &&
    'exitCode' in error &&
    'stderrTail' in error &&
    'args' in error
  )
}

/** Extracts a human-readable message from any thrown value. */
export function errorMessageOf(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

/** Extracts the constructor/error name from any thrown value, when it has one. */
export function errorNameOf(error: unknown): string | null {
  return error instanceof Error ? error.name : null
}

/** Builds a classification with no FFmpeg-specific detail. */
function classification(
  code: ProcessingErrorCode,
  retryable: boolean,
): ProcessingErrorClassification {
  return { code, retryable, exitCode: null, signal: null, stderrTail: null, commandSummary: null }
}

/** Whether `error` (or its message) indicates the underlying storage volume failed. */
function isStorageError(error: unknown, message: string): boolean {
  if (error instanceof Error && STORAGE_ERROR_NAME_PATTERN.test(error.name)) return true
  return STORAGE_ERRNO_PATTERN.test(message)
}

/**
 * Classifies a thrown value into the fixed `TrackProcessingErrorCode` taxonomy, plus
 * whatever FFmpeg process detail is available for a diagnostics panel.
 *
 * `retryable` is advisory today — nothing yet short-circuits BullMQ's retry loop on it.
 */
export function classifyProcessingError(error: unknown): ProcessingErrorClassification {
  if (isFfmpegError(error)) {
    if (error.timedOut) {
      return {
        code: 'TIMEOUT',
        retryable: false,
        exitCode: error.exitCode,
        signal: error.signal,
        stderrTail: error.stderrTail || null,
        commandSummary: error.args.length > 0 ? error.args.join(' ') : null,
      }
    }
    if (error.signal) {
      return {
        code: 'FFMPEG_SIGNAL',
        retryable: true,
        exitCode: error.exitCode,
        signal: error.signal,
        stderrTail: error.stderrTail || null,
        commandSummary: error.args.length > 0 ? error.args.join(' ') : null,
      }
    }
    return {
      code: 'FFMPEG_EXIT',
      retryable: false,
      exitCode: error.exitCode,
      signal: error.signal,
      stderrTail: error.stderrTail || null,
      commandSummary: error.args.length > 0 ? error.args.join(' ') : null,
    }
  }

  const message = errorMessageOf(error)

  if (error instanceof BadRequestException || INVALID_INPUT_PATTERN.test(message)) {
    return classification('INVALID_INPUT', false)
  }
  if (EMPTY_OUTPUT_PATTERN.test(message)) {
    return classification('EMPTY_OUTPUT', false)
  }
  if (isStorageError(error, message)) {
    return classification('STORAGE', true)
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return classification('DATABASE', true)
  }
  return classification('UNKNOWN', true)
}
