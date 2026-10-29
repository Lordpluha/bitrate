'use client'

import { cn } from '@bitrate/ui-react'
import { ArtistName } from '@entities/Artist'
import type { TrackEntity } from '@entities/Track'
import { MediaImage } from '@shared/ui/MediaImage'
import { formatDuration } from '@shared/utils/apiHelpers'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { AudioLines, Play, X } from 'lucide-react'

export type QueueTrackRowProps = {
  index?: number
  isActive?: boolean
  onPlay?: () => void
  onRemove?: () => void
  track: TrackEntity
}

/** One queue row in the design's track-row style: number, cover, title and artist, duration. */
export const QueueTrackRow = ({
  index,
  isActive = false,
  onPlay,
  onRemove,
  track,
}: QueueTrackRowProps) => (
  <li
    className={cn(
      'group grid min-h-16 grid-cols-[42px_minmax(0,1fr)_auto] items-center rounded-lg px-2 py-1.5 transition-colors',
      isActive ? 'bg-secondary' : 'hover:bg-surface',
    )}
  >
    <button
      aria-label={`Play ${track.title}`}
      className="flex justify-center text-[13px] font-semibold text-muted-foreground disabled:cursor-default"
      disabled={!onPlay}
      onClick={onPlay}
      type="button"
    >
      {isActive ? (
        <AudioLines aria-hidden="true" className="text-primary" size={16} />
      ) : (
        <>
          <span className={cn(onPlay && 'group-hover:hidden')}>
            {index ?? '•'}
          </span>
          {onPlay ? (
            <Play
              aria-hidden="true"
              className="hidden text-foreground group-hover:block"
              fill="currentColor"
              size={14}
            />
          ) : null}
        </>
      )}
    </button>

    <span className="flex min-w-0 items-center gap-3">
      <MediaImage
        alt=""
        className="size-11.5 shrink-0 rounded-md object-cover"
        fallback="track"
        height={46}
        src={getTrackCoverUrl(track.cover)}
        unoptimized
        width={46}
      />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span
          className={cn(
            'truncate text-sm font-semibold',
            isActive ? 'text-primary' : 'text-foreground',
          )}
        >
          {track.title}
        </span>
        <span className="truncate text-[13px] text-muted-foreground">
          <ArtistName artistId={track.artistId} />
        </span>
      </span>
    </span>

    <span className="flex items-center gap-2.5 pl-3">
      {onRemove ? (
        <button
          aria-label={`Remove ${track.title} from queue`}
          className="rounded-full p-1 text-muted-foreground opacity-0 transition hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
          onClick={onRemove}
          type="button"
        >
          <X aria-hidden="true" size={16} />
        </button>
      ) : null}
      <span className="min-w-8 text-right text-[13px] tabular-nums text-muted-foreground">
        {formatDuration(track.duration ?? 0)}
      </span>
    </span>
  </li>
)
