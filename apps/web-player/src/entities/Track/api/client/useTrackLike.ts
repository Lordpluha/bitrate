'use client'

import { showApiSuccessToast } from '@shared/api/feedback'
import { useCallback } from 'react'
import { useLikeTrack, useUnlikeTrack } from './useTrackLikeMutations'
import { useLikedTrackIds } from './useTrackQueries'

/** Like state of one track from the server's whole liked list, with a toggle. */
export const useTrackLike = (trackId?: string) => {
  const { data: likedTrackIds } = useLikedTrackIds()
  const likeTrack = useLikeTrack()
  const unlikeTrack = useUnlikeTrack()
  const isLiked = trackId ? (likedTrackIds?.has(trackId) ?? false) : false
  const isPending = likeTrack.isPending || unlikeTrack.isPending

  /** Failures are toasted by the query client's mutation cache. */
  const toggleLike = useCallback(() => {
    if (!trackId || isPending) return

    const variables = { params: { path: { id: trackId } } }
    if (isLiked) {
      unlikeTrack.mutate(variables, {
        onSuccess: () => showApiSuccessToast('Removed from Liked Songs'),
      })
      return
    }

    likeTrack.mutate(variables, {
      onSuccess: () => showApiSuccessToast('Added to Liked Songs'),
    })
  }, [isLiked, isPending, likeTrack, trackId, unlikeTrack])

  return { isLiked, isPending, toggleLike }
}
