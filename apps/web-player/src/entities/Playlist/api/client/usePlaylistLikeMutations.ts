'use client'

import { useMutation } from '@shared/api/client'
import { useQueryClient } from '@tanstack/react-query'
import { invalidatePlaylistDetail } from './playlistQuery'

export const useLikePlaylist = () => {
  const queryClient = useQueryClient()

  return useMutation('post', '/api/v1/playlists/{id}/like', {
    onSuccess: async (_data, variables) => {
      await invalidatePlaylistDetail(queryClient, variables.params.path.id)
    },
  })
}

export const useUnlikePlaylist = () => {
  const queryClient = useQueryClient()

  return useMutation('delete', '/api/v1/playlists/{id}/like', {
    onSuccess: async (_data, variables) => {
      await invalidatePlaylistDetail(queryClient, variables.params.path.id)
    },
  })
}
