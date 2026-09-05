import { queryOptions } from '@shared/api/client'
import { getApiUrl } from '@shared/utils/mediaUrl'
import type { QueryClient } from '@tanstack/react-query'
import type { PlaylistTrack } from './playlist.types'

export const withPlayableTrackUrls = <T extends { tracks?: PlaylistTrack[] }>(
  playlist: T,
) => ({
  ...playlist,
  tracks:
    playlist.tracks?.map((track) => ({
      ...track,
      audioUrl: getApiUrl(`/api/v1/tracks/stream/${track.id}`),
    })) ?? [],
})

export const playlistQueryKeys = {
  lists: ['get', '/api/v1/playlists'] as const,
  mine: () => queryOptions('get', '/api/v1/playlists/me', {}).queryKey,
  detail: (playlistId: string) =>
    queryOptions('get', '/api/v1/playlists/{id}', {
      params: { path: { id: playlistId } },
    }).queryKey,
}

export const invalidatePlaylistLists = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: playlistQueryKeys.lists })

export const invalidateMyPlaylists = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: playlistQueryKeys.mine() })

export const invalidatePlaylistDetail = (
  queryClient: QueryClient,
  playlistId: string,
) =>
  queryClient.invalidateQueries({
    queryKey: playlistQueryKeys.detail(playlistId),
  })
