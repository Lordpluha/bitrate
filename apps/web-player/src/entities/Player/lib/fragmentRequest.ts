import type { ThroughputSample } from '@/entities/Player/lib/adaptiveBitrate'
import type { RequestRetryPolicy } from '@/entities/Player/lib/streamLoaderOptions'

/** What one fragment download needs in order to run and to be measured. */
export type FetchRangeInput = {
  bitrate: number
  range: readonly [number, number]
  signal: AbortSignal
}

/** Everything one retrying fragment request depends on. */
export type RequestFragmentInput = {
  fetchRange: (input: FetchRangeInput) => Promise<ArrayBuffer>
  bitrate: number
  range: readonly [number, number]
  retry: RequestRetryPolicy
  /** Stops the loop when a seek or teardown has superseded this request. */
  isCurrent: () => boolean
  /** Publishes the in-flight controller so a seek can abort it. */
  onRequestStart: (controller: AbortController) => void
  /** Releases the controller once the attempt settles. */
  onRequestEnd: (controller: AbortController) => void
  /** Called once per successful download, when the caller asked to measure. */
  onSample?: (sample: ThroughputSample) => void
}

/** Normalises an unknown thrown value into an Error. */
export const toError = (error: unknown) =>
  error instanceof Error ? error : new Error(String(error))

/** Reads a numeric `status` off an unknown error shape, if it carries one. */
const getErrorStatus = (error: unknown) => {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return null
  }

  const { status } = error
  return typeof status === 'number' ? status : null
}

/** Network faults and 408/429/5xx are worth another attempt; 4xx are not. */
const isRetryableRequestError = (error: unknown) => {
  const status = getErrorStatus(error)
  return status === null || status === 408 || status === 429 || status >= 500
}

/**
 * Waits out a retry backoff. This is a plain delay — it must NOT race against
 * the per-attempt timeout's `AbortController`, which the timeout that just
 * fired already aborted. Teardown/seek cancellation during the wait is caught
 * afterwards via `isCurrent()`, the same currency check every other await in
 * this module honours.
 */
const sleep = (delayMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, Math.max(delayMs, 0)))

/**
 * Downloads one byte range, retrying transient failures with exponential backoff.
 *
 * Resolves to one of two distinct outcomes:
 * - `null` — the request was superseded by a seek or teardown. Benign; the
 *   caller stops quietly.
 * - throws — every retry was exhausted, or the failure was non-retryable.
 *   Fatal; the caller must surface it (`onError`, HLS fallback, etc).
 *
 * A per-attempt timeout is one specific failure among the retryable ones —
 * it still consumes its full retry budget, it never short-circuits to `null`.
 */
export async function requestFragment({
  fetchRange,
  bitrate,
  range,
  retry,
  isCurrent,
  onRequestStart,
  onRequestEnd,
  onSample,
}: RequestFragmentInput): Promise<ArrayBuffer | null> {
  for (let attempt = 1; attempt <= retry.maxAttempts; attempt += 1) {
    if (!isCurrent()) return null

    const controller = new AbortController()
    onRequestStart(controller)
    const startedAt = performance.now()
    let timedOut = false
    const timeoutId = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, retry.timeoutMs)

    try {
      let handleAbort: (() => void) | null = null
      const aborted = new Promise<never>((_resolve, reject) => {
        handleAbort = () => {
          const error = new Error(
            timedOut
              ? 'Audio fragment request timed out'
              : 'Audio fragment request aborted',
          )
          error.name = timedOut ? 'TimeoutError' : 'AbortError'
          reject(error)
        }
        controller.signal.addEventListener('abort', handleAbort, { once: true })
      })

      let bytes: ArrayBuffer
      try {
        bytes = await Promise.race([
          fetchRange({ bitrate, range, signal: controller.signal }),
          aborted,
        ])
      } finally {
        if (handleAbort)
          controller.signal.removeEventListener('abort', handleAbort)
      }

      onSample?.({
        bytes: bytes.byteLength,
        durationMs: performance.now() - startedAt,
      })
      return bytes
    } catch (caughtError) {
      if (controller.signal.aborted && !timedOut) return null

      const error = timedOut
        ? new Error('Audio fragment request timed out')
        : caughtError
      if (
        attempt === retry.maxAttempts ||
        !isRetryableRequestError(caughtError)
      ) {
        throw toError(error)
      }

      clearTimeout(timeoutId)
      const delayMs = retry.baseDelayMs * 2 ** (attempt - 1)
      await sleep(delayMs)
      if (!isCurrent()) return null
    } finally {
      clearTimeout(timeoutId)
      onRequestEnd(controller)
    }
  }

  return null
}
