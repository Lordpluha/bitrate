/** Seconds of audio the loader keeps ahead of the playhead by default. */
const DEFAULT_TARGET_BUFFER_SECONDS = 30

/** Attempts per fragment before the request is treated as failed. */
const DEFAULT_MAX_REQUEST_ATTEMPTS = 3

/** A fragment that has not arrived within this window is retried. */
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000

/** First retry waits this long; each further attempt doubles it. */
const DEFAULT_RETRY_BASE_DELAY_MS = 200

/** Attaching a MediaSource should never take longer than this. */
const DEFAULT_SOURCE_OPEN_TIMEOUT_MS = 10_000

/** How often the fill loop re-checks the buffer. */
export const FILL_TICK_MS = 250

/** Retry budget for one fragment request. */
export type RequestRetryPolicy = {
  maxAttempts: number
  timeoutMs: number
  baseDelayMs: number
}

/** Every tunable of a stream loader, with defaults already applied. */
export type ResolvedStreamLoaderOptions = {
  targetBufferSeconds: number
  sourceOpenTimeoutMs: number
  retry: RequestRetryPolicy
}

/** The subset of loader input that carries tunables. */
export type StreamLoaderTunables = {
  targetBufferSeconds?: number
  maxRequestAttempts?: number
  requestTimeoutMs?: number
  retryBaseDelayMs?: number
  sourceOpenTimeoutMs?: number
}

/** Falls back when a value is missing, non-finite, or not strictly positive. */
const positiveFiniteOr = (value: number | undefined, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback

/** Falls back when a value is missing, non-finite, or negative. Zero is allowed. */
const nonNegativeFiniteOr = (value: number | undefined, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : fallback

/** Applies defaults to whatever tunables the caller supplied. */
export const resolveStreamLoaderOptions = (
  input: StreamLoaderTunables,
): ResolvedStreamLoaderOptions => ({
  targetBufferSeconds:
    input.targetBufferSeconds ?? DEFAULT_TARGET_BUFFER_SECONDS,
  sourceOpenTimeoutMs: positiveFiniteOr(
    input.sourceOpenTimeoutMs,
    DEFAULT_SOURCE_OPEN_TIMEOUT_MS,
  ),
  retry: {
    maxAttempts: Math.max(
      1,
      Math.floor(
        positiveFiniteOr(
          input.maxRequestAttempts,
          DEFAULT_MAX_REQUEST_ATTEMPTS,
        ),
      ),
    ),
    timeoutMs: positiveFiniteOr(
      input.requestTimeoutMs,
      DEFAULT_REQUEST_TIMEOUT_MS,
    ),
    baseDelayMs: nonNegativeFiniteOr(
      input.retryBaseDelayMs,
      DEFAULT_RETRY_BASE_DELAY_MS,
    ),
  },
})
