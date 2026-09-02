'use client'

import { cn } from '@bitrate/ui-react'
import { useLikeTrack, useUnlikeTrack } from '@entities/Track/api/client'
import { showApiSuccessToast } from '@shared/api/feedback'
import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'

type LikeTrackButtonProps = {
  initialLiked?: boolean
  trackId: string
  trackTitle?: string
}

export const LikeTrackButton = ({
  initialLiked = false,
  trackId,
  trackTitle = 'track',
}: LikeTrackButtonProps) => {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const likeTrack = useLikeTrack()
  const unlikeTrack = useUnlikeTrack()
  const isPending = likeTrack.isPending || unlikeTrack.isPending

  useEffect(() => {
    setIsLiked(initialLiked)
  }, [initialLiked])

  const handleToggle = async () => {
    if (isPending) return

    if (isLiked) {
      await unlikeTrack.mutateAsync({
        params: {
          path: {
            id: trackId,
          },
        },
      })
      setIsLiked(false)
      showApiSuccessToast('Removed from Liked Songs')
      return
    }

    await likeTrack.mutateAsync({
      params: {
        path: {
          id: trackId,
        },
      },
    })
    setIsLiked(true)
    showApiSuccessToast('Added to Liked Songs')
  }

  return (
    <button
      aria-label={`${isLiked ? 'Unlike' : 'Like'} ${trackTitle}`}
      className={cn(
        'rounded-full p-1 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60',
        isLiked ? 'text-primary' : 'text-text-subdued hover:text-text',
      )}
      disabled={isPending}
      onClick={(event) => {
        event.stopPropagation()
        void handleToggle()
      }}
      type="button"
    >
      <Heart fill={isLiked ? 'currentColor' : 'none'} size={16} />
    </button>
  )
}
