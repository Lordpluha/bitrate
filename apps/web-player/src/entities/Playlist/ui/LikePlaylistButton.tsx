'use client'

import { cn } from '@bitrate/ui-react'
import { CircleCheck, CirclePlus } from 'lucide-react'
import {
  type LikeablePlaylist,
  usePlaylistLike,
} from '@/entities/Playlist/hooks'

type LikePlaylistButtonProps = {
  playlist: LikeablePlaylist
}

export const LikePlaylistButton = ({ playlist }: LikePlaylistButtonProps) => {
  const { isLiked, isPending, toggleLike } = usePlaylistLike({ playlist })
  const playlistTitle = playlist.title ?? 'playlist'

  return (
    <button
      aria-label={`${isLiked ? 'Remove' : 'Save'} ${playlistTitle}`}
      className={cn(
        'rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        isLiked
          ? 'text-primary hover:text-primary-hover'
          : 'text-muted-foreground hover:text-foreground',
      )}
      disabled={isPending}
      onClick={(event) => {
        event.stopPropagation()
        toggleLike()
      }}
      title={isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
      type="button"
    >
      {isLiked ? (
        <CircleCheck aria-hidden="true" className="size-5 md:size-6.5" />
      ) : (
        <CirclePlus aria-hidden="true" className="size-5 md:size-6.5" />
      )}
    </button>
  )
}
