'use client'

import { showApiSuccessToast } from '@shared/api/feedback'
import { useCallback, useMemo } from 'react'
import { useLikeTrack, useUnlikeTrack } from './useTrackLikeMutations'
import { useLikedTracks } from './useTrackQueries'

/** Like state of one track from the server's liked list, with a toggle. */
export const useTrackLike = (trackId?: string) => {
  const { data: likedTracks } = useLikedTracks()
  const likeTrack = useLikeTrack()
  const unlikeTrack = useUnlikeTrack()
  const likedTrackIds = useMemo(
    () => new Set(likedTracks?.map((track) => track.id) ?? []),
    [likedTracks],
  )
  const isLiked = trackId ? likedTrackIds.has(trackId) : false
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
