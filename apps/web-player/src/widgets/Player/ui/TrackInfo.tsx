import { cn } from '@bitrate/ui-react'
import { MediaImage } from '@shared/ui/MediaImage'
import { Heart } from 'lucide-react'

interface TrackInfoProps {
  title: string
  artist: string
  coverUrl?: string
  isLiked: boolean
  onLikeToggle?: () => void
}

/** The player bar's Player Track: a 60px cover, the title and artist, and the like heart. */
export const TrackInfo = ({
  title,
  artist,
  coverUrl,
  isLiked,
  onLikeToggle,
}: TrackInfoProps) => (
  <div className="flex min-w-0 items-center gap-3.5">
    <MediaImage
      alt={title}
      className="size-15 shrink-0 rounded-md object-cover"
      fallback="track"
      height={60}
      src={coverUrl}
      unoptimized
      width={60}
    />
    <div className="flex min-w-0 flex-col gap-1">
      <div className="truncate text-sm font-semibold text-foreground">
        {title}
      </div>
      <div className="truncate text-xs text-muted-foreground">{artist}</div>
    </div>
    <button
      aria-label={isLiked ? `Unlike ${title}` : `Like ${title}`}
      aria-pressed={isLiked}
      className="shrink-0 p-1 transition-transform hover:scale-110"
      onClick={onLikeToggle}
      type="button"
    >
      <Heart
        className={cn(
          isLiked
            ? 'fill-accent text-accent'
            : 'text-muted-foreground hover:text-foreground',
        )}
        size={18}
      />
    </button>
  </div>
)
