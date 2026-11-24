import { api } from '@/lib/api/client'
import { API_BASE_URL } from '@/lib/api/config'

import { pickRendition } from './pick-rendition'
import { PlaybackError } from './playback-error'

/** Mobile streams cap at this bitrate (kbps) to keep cellular data reasonable. */
const MOBILE_MAX_BITRATE = 256

export type StreamSource = {
  url: string
  durationSec: number
}

/**
 * Opens a play session (`POST /tracks/:id/play-sessions`, ADR-0067) and returns the progressive
 * CMAF URL for the chosen rendition. The URL carries the session token (`?t=`) because the native
 * player fetches byte ranges itself and cannot refresh a cookie.
 */
export async function openStream(trackId: string): Promise<StreamSource> {
  const { data, response } = await api.POST('/api/v1/tracks/{id}/play-sessions', {
    params: { path: { id: trackId } },
    body: {},
  })

  if (response.status === 404) throw new PlaybackError('not-ready')
  if (response.status === 429) throw new PlaybackError('rate-limited')
  if (!response.ok || !data) throw new PlaybackError('failed')

  const rendition = pickRendition(data.manifest.renditions, MOBILE_MAX_BITRATE)
  if (!rendition) throw new PlaybackError('protected')

  const token = encodeURIComponent(data.token)
  return {
    url: `${API_BASE_URL}/api/v1/tracks/${trackId}/cmaf/${rendition.bitrate}?t=${token}`,
    durationSec: data.manifest.durationMs / 1000,
  }
}
