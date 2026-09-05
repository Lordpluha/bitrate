'use client'

import { cn } from '@bitrate/ui-react'
import { useFollowArtist, useUnfollowArtist } from '@entities/Artist/api/client'
import { useIsFollowingArtist } from '@entities/Artist/lib/useIsFollowingArtist'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { useAuth } from '@shared/hooks/useAuth'

export type FollowArtistButtonProps = {
  artistId: string
  artistName?: string
  className?: string
  size?: 'sm' | 'md'
}

/** Toggles the signed-in user's follow state for an artist. */
export const FollowArtistButton = ({
  artistId,
  artistName = 'artist',
  className,
  size = 'md',
}: FollowArtistButtonProps) => {
  const { isAuthenticated } = useAuth()
  const { isFollowing } = useIsFollowingArtist({
    artistId,
    enabled: isAuthenticated,
  })
  const followArtist = useFollowArtist()
  const unfollowArtist = useUnfollowArtist()
  const isPending = followArtist.isPending || unfollowArtist.isPending

  const handleToggle = async () => {
    if (isPending) return

    try {
      if (isFollowing) {
        await unfollowArtist.mutateAsync({ params: { path: { id: artistId } } })
        showApiSuccessToast(`Unfollowed ${artistName}`)
        return
      }

      await followArtist.mutateAsync({ params: { path: { id: artistId } } })
      showApiSuccessToast(`Following ${artistName}`)
    } catch (error) {
      showApiErrorToast(error, 'Could not update follow state')
    }
  }

  if (!isAuthenticated) return null

  return (
    <button
      aria-pressed={isFollowing}
      className={cn(
        'rounded-full border border-white/30 font-bold text-text transition-colors hover:border-white hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' ? 'px-4 py-1.5 text-xs' : 'px-6 py-2 text-sm',
        isFollowing && 'border-white/20 text-text-subdued hover:text-text',
        className,
      )}
      disabled={isPending}
      onClick={(event) => {
        event.stopPropagation()
        void handleToggle()
      }}
      type="button"
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
