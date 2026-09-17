/**
 * Byte ceilings for the redacted text fields on `TrackProcessingAttempt`.
 *
 * These are code constants, not DB constraints — the recorder truncates every value
 * before it ever reaches Prisma, so a field can never grow past the ceiling regardless
 * of how much an FFmpeg stderr stream or a stack trace actually produced.
 */
export const PROCESSING_LOG_LIMITS = {
  errorMessage: 2_048,
  errorStack: 8_192,
  commandSummary: 2_048,
  stderrTail: 16_384,
} as const
