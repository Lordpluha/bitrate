import 'server-only'

import { albumResponseSchema } from '@entities/Album/api/client/albumResponse.schema'
import { ServerApi } from '@shared/api/server'

class AlbumServerApiClass extends ServerApi {
  getById = async (id: string) => {
    const { data, response } = await this.get('/api/v1/albums/{id}', {
      cache: 'force-cache',
      params: { path: { id } },
    } as never)

    if (!response.ok) return null

    const result = albumResponseSchema.safeParse(data)
    return result.success ? result.data : null
  }
}

export const AlbumServerApi = new AlbumServerApiClass()
