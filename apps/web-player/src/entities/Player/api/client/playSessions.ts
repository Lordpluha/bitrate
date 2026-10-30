'use client'

import { z } from 'zod'
import { fetchWithAuthRefresh } from '@shared/api/client'
import { ApiRequestError } from '@shared/api/errors'
import { getApiUrl } from '@shared/utils/mediaUrl'
import { trackManifestSchema } from './trackManifest.schema'

const playSessionSchema = z.object({
  manifest: trackManifestSchema,
  token: z.string().min(1),
  expiresAt: z.number().int().positive(),
})

export type PlaySession = z.infer<typeof playSessionSchema>

export type PlaySessionInput = {
  trackId: string
}

/**
 * The newest session token per track. A play opens its own session (ADR-0067); rendition
 * requests, including the native `<audio>` URL, carry the newest token for their track.
 */
const tokens = new Map<string, string>()

/**
 * Opens a playback session: the manifest to play from and the token every rendition request
 * carries. Returns null for a track that cannot play yet (404).
 */
export const openPlaySession = async ({
  trackId,
}: PlaySessionInput): Promise<PlaySession | null> => {
  const response = await fetchWithAuthRefresh(
    getApiUrl(`/api/v1/tracks/${trackId}/play-sessions`),
    {
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    },
  )

  if (response.status === 404) return null
  if (!response.ok) {
    throw new ApiRequestError(
      'Failed to open a playback session',
      response.status,
    )
  }

  const session = playSessionSchema.parse(await response.json())
  tokens.set(trackId, session.token)
  return session
}

/** The newest session token opened for a track, if any. */
export const playSessionToken = ({ trackId }: PlaySessionInput) =>
  tokens.get(trackId)
