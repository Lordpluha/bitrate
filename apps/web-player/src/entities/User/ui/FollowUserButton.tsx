'use client'

import { cn } from '@bitrate/ui-react'
import {
  useFollowedUsers,
  useFollowUser,
  useUnfollowUser,
} from '@/entities/User/api/client'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { useAuth } from '@/shared/hooks'

type FollowUserButtonProps = {
  className?: string
  userId: string
  username: string
}

export const FollowUserButton = ({
  className,
  userId,
  username,
}: FollowUserButtonProps) => {
  const { isAuthenticated, user } = useAuth()
  const followedUsersQuery = useFollowedUsers(isAuthenticated)
  const followUser = useFollowUser()
  const unfollowUser = useUnfollowUser()
  const isFollowing = (followedUsersQuery.data ?? []).some(
    (followedUser) => followedUser.id === userId,
  )
  const isPending = followUser.isPending || unfollowUser.isPending

  if (!isAuthenticated || user?.id === userId) return null

  const handleToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync({ params: { path: { id: userId } } })
        showApiSuccessToast(`Unfollowed ${username}`)
        return
      }

      await followUser.mutateAsync({ params: { path: { id: userId } } })
      showApiSuccessToast(`Following ${username}`)
    } catch (error) {
      showApiErrorToast(error, 'Could not update follow state')
    }
  }

  return (
    <button
      aria-pressed={isFollowing}
      className={cn(
        'h-9 shrink-0 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      disabled={isPending}
      onClick={() => void handleToggle()}
      type="button"
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
