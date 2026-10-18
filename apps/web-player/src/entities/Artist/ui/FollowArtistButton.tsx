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
        'shrink-0 rounded-md border border-border bg-background font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-sm',
        isFollowing && 'text-muted-foreground hover:text-foreground',
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
