import { queryOptions } from '@tanstack/react-query'

import { api } from '@/lib/api/client'
import { ensureOk } from '@/lib/api/ensure-ok'

import type { PlayableTrack } from './playable-track'
import { catalogKeys } from './query-keys'
import { toPlayableTrack } from './to-playable-track'

const HISTORY_LIMIT = 30

/** Recently played tracks, newest first, each track once (`GET /history`). */
export const historyQuery = queryOptions({
  queryKey: catalogKeys.history,
  queryFn: async (): Promise<PlayableTrack[]> => {
    const { data, response } = await api.GET('/api/v1/history', {
      params: { query: { page: 1, limit: HISTORY_LIMIT } },
    })
    ensureOk(response, 'Failed to load listening history')

    const seen = new Set<string>()
    return (data?.data ?? [])
      .filter((entry) => !seen.has(entry.trackId) && seen.add(entry.trackId))
      .map((entry) => toPlayableTrack({ track: entry.track }))
  },
})
