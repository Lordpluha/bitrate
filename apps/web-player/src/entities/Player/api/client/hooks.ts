'use client'

import { fetchWithAuthRefresh } from '@shared/api/client'
import { ApiRequestError } from '@shared/api/errors'
import { getApiUrl } from '@shared/utils/mediaUrl'

export type FetchRenditionRangeInput = {
  trackId: string
  bitrate: number
  range: readonly [number, number]
  signal: AbortSignal
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
  range,
  signal,
}: FetchRenditionRangeInput): Promise<ArrayBuffer> => {
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

  if (!response.ok) {
    throw new ApiRequestError('Failed to fetch audio fragment', response.status)
  }

  return response.arrayBuffer()
}
