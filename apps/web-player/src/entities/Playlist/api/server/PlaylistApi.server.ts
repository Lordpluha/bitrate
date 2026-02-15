import 'server-only'

import { ServerApi } from '@shared/api/server'

class PlaylistServerApiClass extends ServerApi {
  getPlaylists = (id: string) =>
    this.get('/api/v1/playlists/{id}', {
      params: {
        path: {
          id,
        },
      },
    })
}

export const PlaylistServerApi = new PlaylistServerApiClass()
