'use client'

import { fetchWithAuthRefresh } from '@shared/api/client'
import { ApiRequestError } from '@shared/api/errors'
import { getApiUrl } from '@shared/utils/mediaUrl'
import { openPlaySession, playSessionToken } from './playSessions'

export type FetchRenditionRangeInput = {
  trackId: string
  bitrate: number
  expectedSize: number
  range: readonly [number, number]
  signal: AbortSignal
}

export type GetRenditionUrlInput = {
  trackId: string
  bitrate: number
}

/**
 * The URL of one CMAF rendition file with the track's newest playback session token
 * (ADR-0067): fragment ranges are read from it, and a browser without MSE plays it
 * through `<audio>`.
 */
export const getRenditionUrl = ({ trackId, bitrate }: GetRenditionUrlInput) =>
  getApiUrl(
    `/api/v1/tracks/${trackId}/cmaf/${bitrate}?t=${encodeURIComponent(
      playSessionToken({ trackId }) ?? '',
    )}`,
  )

/** Wait when a 429 names no usable `Retry-After`. */
const DEFAULT_RETRY_AFTER_SECONDS = 1

type WaitForRetryInput = {
  retryAfter: string | null
  signal: AbortSignal
}

/** Waits the `Retry-After` a paced session asked for, unless the request is aborted. */
const waitForRetry = ({ retryAfter, signal }: WaitForRetryInput) =>
  new Promise<void>((resolve, reject) => {
    const seconds = Number(retryAfter)
    const delayMs =
      Number.isFinite(seconds) && seconds >= 0
        ? seconds * 1000
        : DEFAULT_RETRY_AFTER_SECONDS * 1000
    const timer = setTimeout(resolve, delayMs)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true },
    )
  })

const CONTENT_RANGE_PATTERN = /^bytes (\d+)-(\d+)\/(\d+)$/i

const parseContentRange = (value: string | null) => {
  const match = value?.match(CONTENT_RANGE_PATTERN)
  if (!match) return null

  const start = Number(match[1])
  const end = Number(match[2])
  const total = Number(match[3])
  if (![start, end, total].every(Number.isSafeInteger)) return null

  return { end, start, total }
}

/**
 * Fetches one inclusive byte window of a rendition.
 * Kept as a plain function rather than a hook: the loader calls it per fragment,
 * outside React's render cycle.
 *
 * The manifest itself is fetched by `useManifestResolver`, which routes through
 * the React Query cache so a track resolves once for both playback slots.
 */
export const fetchRenditionRange = async ({
  trackId,
  bitrate,
  expectedSize,
  range,
  signal,
}: FetchRenditionRangeInput): Promise<ArrayBuffer> => {
  const [rangeStart, rangeEnd] = range
  if (
    !Number.isSafeInteger(rangeStart) ||
    !Number.isSafeInteger(rangeEnd) ||
    !Number.isSafeInteger(expectedSize) ||
    rangeStart < 0 ||
    rangeEnd < rangeStart ||
    expectedSize <= rangeEnd
  ) {
    throw new RangeError('Invalid audio fragment byte range')
  }

  /**
   * A play session outlives the access token TTL more often than any other API
   * call in the app — a track can play for minutes while every other request
   * on the page is a quick click. `fetchWithAuthRefresh` retries once after a
   * silent refresh instead of failing the fragment and killing playback.
   */
  let reopened = false
  let response: Response
  while (true) {
    response = await fetchWithAuthRefresh(
      getRenditionUrl({ bitrate, trackId }),
      {
        headers: { Range: `bytes=${range[0]}-${range[1]}` },
        signal,
      },
    )
    /** An expired or revoked session: open one new session and retry once (D8). */
    if (response.status === 403 && !reopened) {
      reopened = true
      await openPlaySession({ trackId })
      continue
    }
    /** The session is ahead of real time (D16): wait as asked and retry. */
    if (response.status === 429) {
      await waitForRetry({
        retryAfter: response.headers.get('Retry-After'),
        signal,
      })
      continue
    }
    break
  }

  if (response.status === 416) {
    throw new ApiRequestError(
      'Audio fragment range is not satisfiable',
      response.status,
    )
  }

  if (response.status !== 206) {
    throw new ApiRequestError('Failed to fetch audio fragment', response.status)
  }

  const contentRange = parseContentRange(response.headers.get('Content-Range'))
  if (
    !contentRange ||
    contentRange.start !== rangeStart ||
    contentRange.end !== rangeEnd ||
    contentRange.total !== expectedSize
  ) {
    throw new Error('Audio fragment response has an invalid Content-Range')
  }

  const expectedLength = rangeEnd - rangeStart + 1
  const contentLength = response.headers.get('Content-Length')
  if (
    contentLength !== null &&
    (!/^\d+$/.test(contentLength) || Number(contentLength) !== expectedLength)
  ) {
    throw new Error('Audio fragment response has an invalid Content-Length')
  }

  const bytes = await response.arrayBuffer()
  if (bytes.byteLength !== expectedLength) {
    throw new Error('Audio fragment response body has an unexpected length')
  }

  return bytes
}
