'use client'

import { useMutation } from '@shared/api/client'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useQueryClient } from '@tanstack/react-query'
import { trackDetailQueryKey } from './trackQuery'

const useInvalidateTrackLikes = () => {
  const queryClient = useQueryClient()

  return async (trackId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.tracks.likedAll }),
      queryClient.invalidateQueries({ queryKey: trackDetailQueryKey(trackId) }),
    ])
  }
}

export const useLikeTrack = () => {
  const invalidateTrackLikes = useInvalidateTrackLikes()

  return useMutation('post', '/api/v1/tracks/{id}/like', {
    onSuccess: (_data, variables) =>
      invalidateTrackLikes(variables.params.path.id),
  })
}

export const useUnlikeTrack = () => {
  const invalidateTrackLikes = useInvalidateTrackLikes()

  return useMutation('delete', '/api/v1/tracks/{id}/like', {
    onSuccess: (_data, variables) =>
      invalidateTrackLikes(variables.params.path.id),
  })
}
