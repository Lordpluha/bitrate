import 'server-only'

import { artistResponseSchema } from '@entities/Artist/api/client/artistResponse.schema'
import { ServerApi } from '@shared/api/server'

class ArtistServerApiClass extends ServerApi {
  getById = async (id: string) => {
    const { data, response } = await this.get('/api/v1/artists/{id}', {
      cache: 'force-cache',
      params: { path: { id } },
    })

    if (!response.ok) return null

    const result = artistResponseSchema.safeParse(data)
    return result.success ? result.data : null
  }
}

export const ArtistServerApi = new ArtistServerApiClass()
