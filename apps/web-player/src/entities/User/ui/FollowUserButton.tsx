'use client'

import { cn } from '@bitrate/ui-react'
import {
  useFollowedUsers,
  useFollowUser,
  useUnfollowUser,
} from '@/entities/User/api/client'
import { showApiSuccessToast } from '@/shared/api/feedback'
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

  /** Failures are toasted by the query client's mutation cache. */
  const handleToggle = () => {
    const variables = { params: { path: { id: userId } } }
    if (isFollowing) {
      unfollowUser.mutate(variables, {
        onSuccess: () => showApiSuccessToast(`Unfollowed ${username}`),
      })
      return
    }

    followUser.mutate(variables, {
      onSuccess: () => showApiSuccessToast(`Following ${username}`),
    })
  }

  return (
    <button
      aria-pressed={isFollowing}
      className={cn(
        'h-9 shrink-0 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      disabled={isPending}
      onClick={handleToggle}
      type="button"
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
