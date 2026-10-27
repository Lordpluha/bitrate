'use client'

import { cn } from '@bitrate/ui-react'
import { useTrackLike } from '@entities/Track/api/client'
import { Heart } from 'lucide-react'

type LikeButtonProps = {
  className?: string
  disabled?: boolean
  isLiked: boolean
  onToggle: () => void
  /** Icon size: 16 in rows, 18 on the player bar, 22-24 on now-playing surfaces. */
  size?: 16 | 18 | 22 | 24
  trackTitle?: string
}

/** How every like button looks and is labelled; `LikeTrackButton` wires it to the server. */
export const LikeButton = ({
  className,
  disabled = false,
  isLiked,
  onToggle,
  size = 16,
  trackTitle = 'track',
}: LikeButtonProps) => (
  <button
    aria-label={
      isLiked
        ? `Remove ${trackTitle} from Liked Songs`
        : `Save ${trackTitle} to Liked Songs`
    }
    aria-pressed={isLiked}
    className={cn(
      'shrink-0 rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60',
      isLiked ? 'text-accent' : 'text-muted-foreground hover:text-foreground',
      className,
    )}
    disabled={disabled}
    onClick={(event) => {
      event.stopPropagation()
      onToggle()
    }}
    type="button"
  >
    <Heart
      aria-hidden="true"
      fill={isLiked ? 'currentColor' : 'none'}
      size={size}
    />
  </button>
)

type LikeTrackButtonProps = Pick<
  LikeButtonProps,
  'className' | 'size' | 'trackTitle'
> & {
  trackId: string
}

/**
 * The like button for a track. Its state comes from the server's liked list, so every
 * surface showing the same track agrees; a click never reaches the row around it.
 */
export const LikeTrackButton = ({
  trackId,
  ...props
}: LikeTrackButtonProps) => {
  const { isLiked, isPending, toggleLike } = useTrackLike(trackId)

  return (
    <LikeButton
      {...props}
      disabled={isPending}
      isLiked={isLiked}
      onToggle={toggleLike}
    />
  )
}
