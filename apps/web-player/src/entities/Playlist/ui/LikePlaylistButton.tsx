'use client'

import { cn } from '@spotify/ui-react'
import { Check, CirclePlus } from 'lucide-react'
import {
  type LikeablePlaylist,
  usePlaylistLike,
} from '@/entities/Playlist/hooks'

type LikePlaylistButtonProps = {
  initialLiked?: boolean
  playlist: LikeablePlaylist
}

export const LikePlaylistButton = ({
  initialLiked = false,
  playlist,
}: LikePlaylistButtonProps) => {
  const { isLiked, isPending, toggleLike } = usePlaylistLike({
    initialLiked,
    playlist,
  })
  const playlistTitle = playlist.title ?? 'playlist'

  return (
    <button
      aria-label={`${isLiked ? 'Remove' : 'Save'} ${playlistTitle}`}
      className={cn(
        'rounded-full p-1 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60',
        isLiked ? 'text-green-500' : 'text-text-subdued hover:text-text',
      )}
      disabled={isPending}
      onClick={(event) => {
        event.stopPropagation()
        void toggleLike()
      }}
      title={isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
      type="button"
    >
      {isLiked ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-black">
          <Check size={20} strokeWidth={3} />
        </span>
      ) : (
        <CirclePlus size={34} />
      )}
    </button>
  )
}
