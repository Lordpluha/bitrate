import 'server-only'

import { artistResponseSchema } from '@entities/Artist/api/client/artistResponse.schema'
import { ServerApi } from '@shared/api/server'

class ArtistServerApiClass extends ServerApi {
  /** For page metadata. Revalidated, not cached for good: a username can be renamed or freed. */
  getByUsername = async (username: string) => {
    const { data, response } = await this.get(
      '/api/v1/artists/username/{username}',
      { next: { revalidate: 300 }, params: { path: { username } } },
    )

    if (!response.ok) return null

    const result = artistResponseSchema.safeParse(data)
    return result.success ? result.data : null
  }

  /**
   * The current username of the artist with this id, or null when there is no such artist.
   * Uncached: usernames can change, and an old id link must reach the current one. A server
   * failure throws, so the page shows its retry state instead of a false "not found".
   */
  findUsernameById = async (id: string) => {
    const { data, response } = await this.get('/api/v1/artists/{id}', {
      cache: 'no-store',
      params: { path: { id } },
    })

    if (response.status >= 500) {
      throw new Error(`Artist lookup failed with status ${response.status}`)
    }
    if (!response.ok) return null

    /* an unknown or deleted artist answers 200 with an empty body */
    const result = artistResponseSchema.safeParse(data)
    return result.success ? result.data.username : null
  }
}

export const ArtistServerApi = new ArtistServerApiClass()
