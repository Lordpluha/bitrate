import 'server-only'

import { ServerApi } from '@shared/api/server'

class PlaylistServerApiClass extends ServerApi {
  getPlaylists = async (id: string) => {
    const { data, ...etc } = await this.get('/api/v1/playlists/{id}', {
      cache: 'no-store',
      params: {
        path: {
          id,
        },
      },
    })

    if (!etc.response.ok || !data) {
      return {
        data,
        ...etc,
      }
    }

    const apiBaseUrl = process.env.API_URL?.replace(/\/$/, '')
    if (!apiBaseUrl) {
      throw new Error('API_URL is required to build playlist media URLs')
    }

    const resultDataTracks = data?.tracks?.map((track) => ({
      ...track,
      audioUrl: `${apiBaseUrl}/api/v1/tracks/stream/${track.id}`,
    }))
    return {
      data: {
        ...data,
        tracks: resultDataTracks,
      },
      ...etc,
    }
  }
}

export const PlaylistServerApi = new PlaylistServerApiClass()
