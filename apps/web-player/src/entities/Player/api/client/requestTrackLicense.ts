'use client'

import { fetchWithAuthRefresh } from '@shared/api/client'
import { ApiRequestError } from '@shared/api/errors'
import { getApiUrl } from '@shared/utils/mediaUrl'
import { openPlaySession, playSessionToken } from './playSessions'

export type RequestTrackLicenseInput = {
  trackId: string
  /** The CDM's ClearKey licence request, sent as is. */
  message: ArrayBuffer
  signal?: AbortSignal
}

/** One licence request with the track's newest session token. */
const send = ({ trackId, message, signal }: RequestTrackLicenseInput) =>
  fetchWithAuthRefresh(
    getApiUrl(
      `/api/v1/tracks/${trackId}/license?t=${encodeURIComponent(
        playSessionToken({ trackId }) ?? '',
      )}`,
    ),
    {
      body: message,
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      ...(signal ? { signal } : {}),
    },
  )

/**
 * Gets the ClearKey licence of an encrypted track for its play session (ADR-0077). Like a
 * rendition request, an expired or revoked session is reopened once (ADR-0067 D8).
 */
export const requestTrackLicense = async (
  input: RequestTrackLicenseInput,
): Promise<ArrayBuffer> => {
  let response = await send(input)
  if (response.status === 403) {
    await openPlaySession({ trackId: input.trackId })
    response = await send(input)
  }
  if (!response.ok) {
    throw new ApiRequestError(
      'Failed to get the track licence',
      response.status,
    )
  }
  return response.arrayBuffer()
}
