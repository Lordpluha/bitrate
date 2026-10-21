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

  /** Failures are toasted by the query client's mutation cache. */
  const handleToggle = () => {
    if (isPending) return

    const variables = { params: { path: { id: trackId } } }
    if (isLiked) {
      unlikeTrack.mutate(variables, {
        onSuccess: () => {
          setIsLiked(false)
          showApiSuccessToast('Removed from Liked Songs')
        },
      })
      return
    }

    likeTrack.mutate(variables, {
      onSuccess: () => {
        setIsLiked(true)
        showApiSuccessToast('Added to Liked Songs')
      },
    })
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
        handleToggle()
      }}
      type="button"
    >
      <Heart fill={isLiked ? 'currentColor' : 'none'} size={16} />
    </button>
  )
}
