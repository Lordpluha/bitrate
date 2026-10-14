'use client'

import { useMutation } from '@shared/api/client'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useQueryClient } from '@tanstack/react-query'
import { invalidatePlaylistDetail } from './playlistQuery'

export const useLikePlaylist = () => {
  const queryClient = useQueryClient()

  return useMutation('post', '/api/v1/playlists/{id}/like', {
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
