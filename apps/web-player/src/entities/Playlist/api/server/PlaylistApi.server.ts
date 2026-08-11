import 'server-only'

import { playlistWithRelationsResponseSchema } from '@entities/Playlist/api/client/playlistResponse.schema'
import { ServerApi } from '@shared/api/server'

class PlaylistServerApiClass extends ServerApi {
  getMetadataById = async (id: string) => {
    const { data, response } = await this.get('/api/v1/playlists/{id}', {
      cache: 'no-store',
      params: { path: { id } },
    })

    if (!response.ok) return null

    const result = playlistWithRelationsResponseSchema.safeParse(data)
    return result.success ? result.data : null
  }

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
