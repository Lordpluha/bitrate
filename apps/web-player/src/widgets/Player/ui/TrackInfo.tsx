import { MediaImage } from '@shared/ui/MediaImage'
import { LikeButton } from '@/entities/Track'

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
    {onLikeToggle ? (
      <LikeButton
        isLiked={isLiked}
        onToggle={onLikeToggle}
        size={18}
        trackTitle={title}
      />
    ) : null}
  </div>
)
