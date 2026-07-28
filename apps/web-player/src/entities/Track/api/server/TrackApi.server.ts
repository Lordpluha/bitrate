import { ServerApi } from '@shared/api/server'
import 'server-only'
import { tracksResponseSchema } from '@entities/Track/api/trackResponse.schema'

class TrackApiServerClass extends ServerApi {
  getLiked = async () => {
    const { data } = await this.get('/api/v1/tracks/liked')

    return data ? tracksResponseSchema.parse(data) : null
  }
}

export const TrackServerApi = new TrackApiServerClass()
