import { queryOptions } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api/api-fetch'
import { api } from '@/lib/api/client'
import { ensureOk } from '@/lib/api/ensure-ok'

import type { PlayableTrack } from './playable-track'
import { catalogKeys } from './query-keys'
import { albumWithTracksSchema } from './schemas/track-list-schema'
import { toPlayableTrack } from './to-playable-track'

export type CollectionRef = { kind: 'album' | 'playlist'; id: string }

/** `GET /albums/{id}` — via `apiFetch`, since its contract omits the path parameter. */
async function fetchAlbumTracks(id: string): Promise<PlayableTrack[]> {
  const response = await apiFetch(`/api/v1/albums/${encodeURIComponent(id)}`)
  ensureOk(response, 'Failed to load album')
  const album = albumWithTracksSchema.parse(await response.json())
  return (album.tracks ?? []).map((track) => toPlayableTrack({ track, fallbackCover: album.cover }))
}

async function fetchPlaylistTracks(id: string): Promise<PlayableTrack[]> {
  const { data, response } = await api.GET('/api/v1/playlists/{id}', { params: { path: { id } } })
  ensureOk(response, 'Failed to load playlist')
  return (data?.tracks ?? []).map((track) => toPlayableTrack({ track }))
}

/** The tracks of an album or playlist, in play order — what "play" on a feed card queues. */
export const collectionTracksQuery = ({ kind, id }: CollectionRef) =>
  queryOptions({
    queryKey: catalogKeys.collection(kind, id),
    queryFn: () => (kind === 'album' ? fetchAlbumTracks(id) : fetchPlaylistTracks(id)),
  })
