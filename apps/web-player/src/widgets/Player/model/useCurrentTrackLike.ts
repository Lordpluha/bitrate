'use client'

import { useLikeTrack, useLikedTracks, useUnlikeTrack } from '@entities/Track'
import { showApiSuccessToast } from '@shared/api/feedback'
import { useCallback, useMemo } from 'react'

export const useCurrentTrackLike = (trackId?: string) => {
  const { data: likedTracks } = useLikedTracks()
  const likeTrack = useLikeTrack()
  const unlikeTrack = useUnlikeTrack()
  const likedTrackIds = useMemo(
    () => new Set(likedTracks?.map((track) => track.id) ?? []),
    [likedTracks],
  )
  const isLiked = trackId ? likedTrackIds.has(trackId) : false
  const isPending = likeTrack.isPending || unlikeTrack.isPending

  const toggleLike = useCallback(async () => {
    if (!trackId || isPending) return

    if (isLiked) {
      await unlikeTrack.mutateAsync({ params: { path: { id: trackId } } })
      showApiSuccessToast('Removed from Liked Songs')
      return
    }

    await likeTrack.mutateAsync({ params: { path: { id: trackId } } })
    showApiSuccessToast('Added to Liked Songs')
  }, [isLiked, isPending, likeTrack, trackId, unlikeTrack])

  return { isLiked, isPending, toggleLike }
}
