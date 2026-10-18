import { cn } from '@bitrate/ui-react'
import { ArtistName } from '@entities/Artist'
import { MediaImage } from '@shared/ui/MediaImage'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import type { KeyboardEventHandler } from 'react'
import type { TrackEntity } from '../models/schema/Track.entity'

type TrackPrimaryInfoProps = {
  isCurrent: boolean
  onClick: () => void
  onKeyDown: KeyboardEventHandler<HTMLButtonElement>
  track: TrackEntity
  viewMode: 'compact' | 'list'
}

export const TrackPrimaryInfo = ({
  isCurrent,
  onClick,
  onKeyDown,
  track,
  viewMode,
}: TrackPrimaryInfoProps) => (
  <button
    className="flex min-w-0 items-center gap-3 pr-4 text-left max-[1024px]:pr-0"
    onClick={onClick}
    onKeyDown={onKeyDown}
    type="button"
  >
    <div
      className={cn(
        'relative size-11.5 shrink-0 overflow-hidden rounded-md max-[1024px]:size-12',
        viewMode === 'list' ? 'block' : 'hidden max-[1024px]:block',
      )}
    >
      <MediaImage
        alt=""
        className="h-full w-full object-cover"
        fallback="track"
        height={48}
        src={getTrackCoverUrl(track.cover)}
        unoptimized
        width={48}
      />
    </div>
    <div className="flex min-w-0 flex-col gap-0.5">
      <div
        className={cn(
          'truncate text-sm font-semibold',
          isCurrent ? 'text-primary' : 'text-text group-hover:underline',
        )}
      >
        {track.title}
      </div>
      <div className="truncate text-[13px] text-muted-foreground">
        <ArtistName artistId={track.artistId} />
      </div>
    </div>
  </button>
)
