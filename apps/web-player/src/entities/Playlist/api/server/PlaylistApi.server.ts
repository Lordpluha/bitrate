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

    const resultDataTracks = data?.tracks?.map((track) => ({
      ...track,
      audioUrl: `${process.env.API_URL?.replace(/\/$/, '')}/api/v1/tracks/stream/${track.id}`,
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
