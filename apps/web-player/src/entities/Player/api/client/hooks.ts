'use client'

import { fetchWithAuthRefresh } from '@shared/api/client'
import { ApiRequestError } from '@shared/api/errors'
import { getApiUrl } from '@shared/utils/mediaUrl'

export type FetchRenditionRangeInput = {
  trackId: string
  bitrate: number
  expectedSize: number
  range: readonly [number, number]
  signal: AbortSignal
}

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
  const response = await fetchWithAuthRefresh(
    getApiUrl(`/api/v1/tracks/${trackId}/cmaf/${bitrate}`),
    {
      headers: { Range: `bytes=${range[0]}-${range[1]}` },
      signal,
    },
  )

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
