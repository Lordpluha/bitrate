import 'server-only'

import { tracksResponseSchema } from '@entities/Track/api/trackResponse.schema'
import { ApiRequestError, ensureOkResponse } from '@shared/api/errors'
import { ServerApi } from '@shared/api/server'

class TrackApiServerClass extends ServerApi {
  getLiked = async () => {
    const { data, response } = await this.get('/api/v1/tracks/liked', {
      params: { query: { page: 1, limit: 100 } },
    })

    ensureOkResponse(response, 'Failed to fetch liked tracks')

    if (!data) {
      throw new ApiRequestError('Liked tracks response is empty', 502)
    }

    return tracksResponseSchema.parse(data)
  }
}

export const TrackServerApi = new TrackApiServerClass()
