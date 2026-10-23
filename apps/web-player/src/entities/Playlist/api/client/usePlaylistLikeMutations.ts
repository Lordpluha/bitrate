'use client'

import { useMutation } from '@shared/api/client'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useQueryClient } from '@tanstack/react-query'
import { invalidatePlaylistDetail } from './playlistQuery'

/** Fallback for the mutation cache's error toast. */
const PLAYLIST_LIKE_ERROR_MESSAGE = 'Failed to update the playlist'

export const useLikePlaylist = () => {
  const queryClient = useQueryClient()

  return useMutation('post', '/api/v1/playlists/{id}/like', {
    meta: { errorMessage: PLAYLIST_LIKE_ERROR_MESSAGE },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        invalidatePlaylistDetail(queryClient, variables.params.path.id),
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.playlists.liked,
        }),
      ])
    },
  })
}

export const useUnlikePlaylist = () => {
  const queryClient = useQueryClient()

  return useMutation('delete', '/api/v1/playlists/{id}/like', {
    meta: { errorMessage: PLAYLIST_LIKE_ERROR_MESSAGE },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        invalidatePlaylistDetail(queryClient, variables.params.path.id),
        queryClient.invalidateQueries({
          queryKey: apiQueryKeys.playlists.liked,
        }),
      ])
    },
  })
}
