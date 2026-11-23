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

  getPlaylists = (id: string) =>
    this.get('/api/v1/playlists/{id}', {
      cache: 'no-store',
      params: {
        path: {
          id,
        },
      },
    })
}

export const PlaylistServerApi = new PlaylistServerApiClass()
