import { queryOptions } from '@tanstack/react-query'

import { api } from '@/lib/api/client'
import { ensureOk } from '@/lib/api/ensure-ok'

import type { PlayableTrack } from './playable-track'
import { catalogKeys } from './query-keys'
import { trackListSchema } from './schemas/track-list-schema'
import { toPlayableTrack } from './to-playable-track'

const LIKED_LIMIT = 100

/** Liked tracks (`GET /tracks/liked`); the contract leaves the body untyped, so it is validated. */
export const likedTracksQuery = queryOptions({
  queryKey: catalogKeys.likedTracks,
  queryFn: async (): Promise<PlayableTrack[]> => {
    const { data, response } = await api.GET('/api/v1/tracks/liked', {
      params: { query: { page: 1, limit: LIKED_LIMIT } },
    })
    ensureOk(response, 'Failed to load liked tracks')
    return trackListSchema.parse(data).map((track) => toPlayableTrack({ track }))
  },
})
