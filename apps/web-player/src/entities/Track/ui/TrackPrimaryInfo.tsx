import { ArtistName } from '@entities/Artist'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { cn } from '@spotify/ui-react'
import Image from 'next/image'
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
    className="flex min-w-0 items-center gap-3 text-left"
    onClick={onClick}
    onKeyDown={onKeyDown}
    type="button"
  >
    <div
      className={cn(
        'relative h-10 w-10 shrink-0 overflow-hidden rounded',
        viewMode === 'list' ? 'block' : 'hidden max-[1024px]:block',
      )}
    >
      <Image
        alt=""
        className="h-full w-full object-cover"
        height={40}
        src={getTrackCoverUrl(track.cover)}
        unoptimized
        width={40}
      />
    </div>
    <div className="min-w-0">
      <div
        className={cn(
          'truncate font-medium',
          isCurrent ? 'text-primary' : 'text-text group-hover:underline',
        )}
      >
        {track.title}
      </div>
      <div className="truncate text-sm text-text-subdued max-[1024px]:text-xs">
        <ArtistName artistId={track.artistId} />
      </div>
    </div>
  </button>
)
