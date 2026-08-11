'use client'

import { useLikeAlbum, useUnlikeAlbum } from '@entities/Album/api/client'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { cn } from '@spotify/ui-react'
import { CheckCircle, Heart } from 'lucide-react'
import { useState } from 'react'

export type LikeAlbumButtonProps = {
  albumId: string
  albumTitle?: string
  className?: string
  initialLiked?: boolean
}

/**
 * Saves or removes an album from the user's library.
 * The API exposes no "is liked" flag on the album payload, so state starts from
 * `initialLiked` and is tracked locally for the session.
 */
export const LikeAlbumButton = ({
  albumId,
  albumTitle = 'album',
  className,
  initialLiked = false,
}: LikeAlbumButtonProps) => {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const likeAlbum = useLikeAlbum()
  const unlikeAlbum = useUnlikeAlbum()
  const isPending = likeAlbum.isPending || unlikeAlbum.isPending

  const handleToggle = async () => {
    if (isPending) return

    try {
      if (isLiked) {
        await unlikeAlbum.mutateAsync({ params: { path: { id: albumId } } })
        setIsLiked(false)
        showApiSuccessToast('Album removed from library')
        return
      }

      await likeAlbum.mutateAsync({ params: { path: { id: albumId } } })
      setIsLiked(true)
      showApiSuccessToast('Album saved to library')
    } catch (error) {
      showApiErrorToast(error, 'Could not update your library')
    }
  }

  return (
    <button
      aria-label={`${isLiked ? 'Remove' : 'Save'} ${albumTitle} ${isLiked ? 'from' : 'to'} your library`}
      aria-pressed={isLiked}
      className={cn(
        'flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      disabled={isPending}
      onClick={(event) => {
        event.stopPropagation()
        void handleToggle()
      }}
      type="button"
    >
      {isLiked ? (
        <CheckCircle className="fill-green-500 text-green-500" size={18} />
      ) : (
        <Heart size={18} />
      )}
      {isLiked ? 'Saved' : 'Save'}
    </button>
  )
}
