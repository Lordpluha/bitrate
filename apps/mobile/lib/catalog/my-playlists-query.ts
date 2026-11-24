import { queryOptions } from '@tanstack/react-query'

import { api } from '@/lib/api/client'
import { ensureOk } from '@/lib/api/ensure-ok'
import { resolveMediaUrl } from '@/lib/api/media-url'

import { catalogKeys } from './query-keys'

export type PlaylistSummary = {
  id: string
  title: string
  coverUrl: string | null
}

const PLAYLISTS_LIMIT = 50

/** The listener's own playlists (`GET /playlists/me`). */
export const myPlaylistsQuery = queryOptions({
  queryKey: catalogKeys.myPlaylists,
  queryFn: async (): Promise<PlaylistSummary[]> => {
    const { data, response } = await api.GET('/api/v1/playlists/me', {
      params: { query: { page: 1, limit: PLAYLISTS_LIMIT } },
    })
    ensureOk(response, 'Failed to load playlists')
    return (data?.data ?? []).map((playlist) => ({
      id: playlist.id,
      title: playlist.title,
      coverUrl: resolveMediaUrl(playlist.cover, 'playlists/covers'),
    }))
  },
})
