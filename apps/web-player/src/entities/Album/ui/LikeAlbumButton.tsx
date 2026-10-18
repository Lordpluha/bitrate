'use client'

import { cn } from '@bitrate/ui-react'
import {
  useLikeAlbum,
  useLikedAlbums,
  useUnlikeAlbum,
} from '@entities/Album/api/client'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { useAuth } from '@shared/hooks'
import { Heart } from 'lucide-react'

export type LikeAlbumButtonProps = {
  albumId: string
  albumTitle?: string
  className?: string
}

/** The album action bar's heart: saves or removes an album; the state comes from the server's saved list (`GET /albums/liked`). */
export const LikeAlbumButton = ({
  albumId,
  albumTitle = 'album',
  className,
}: LikeAlbumButtonProps) => {
  const { user } = useAuth()
  const { data: likedAlbums } = useLikedAlbums(Boolean(user))
  const isLiked = likedAlbums?.some((album) => album.id === albumId) ?? false
  const likeAlbum = useLikeAlbum()
  const unlikeAlbum = useUnlikeAlbum()
  const isPending = likeAlbum.isPending || unlikeAlbum.isPending

  const handleToggle = async () => {
    if (isPending) return

    try {
      if (isLiked) {
        await unlikeAlbum.mutateAsync({ params: { path: { id: albumId } } })
        showApiSuccessToast('Album removed from library')
        return
      }

      await likeAlbum.mutateAsync({ params: { path: { id: albumId } } })
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
        'rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        isLiked
          ? 'text-primary hover:text-primary-hover'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      disabled={isPending}
      onClick={(event) => {
        event.stopPropagation()
        void handleToggle()
      }}
      type="button"
    >
      <Heart
        aria-hidden="true"
        className="size-5 md:size-6.5"
        fill={isLiked ? 'currentColor' : 'none'}
      />
    </button>
  )
}
