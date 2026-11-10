import { queryOptions } from '@shared/api/client'
import type { QueryClient } from '@tanstack/react-query'

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
