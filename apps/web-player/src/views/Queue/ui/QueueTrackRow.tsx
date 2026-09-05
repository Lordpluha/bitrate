'use client'

import { cn } from '@bitrate/ui-react'
import { ArtistName } from '@entities/Artist'
import type { TrackEntity } from '@entities/Track'
import { formatDuration } from '@shared/utils/apiHelpers'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { Play, X } from 'lucide-react'
import Image from 'next/image'

export type QueueTrackRowProps = {
  index?: number
  isActive?: boolean
  onPlay?: () => void
  onRemove?: () => void
  track: TrackEntity
}

/** One row of the queue screen: cover, title, artist, duration and optional remove. */
export const QueueTrackRow = ({
  index,
  isActive = false,
  onPlay,
  onRemove,
  track,
}: QueueTrackRowProps) => (
  <li className="group grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-surface-hover sm:gap-4 sm:px-3">
    <button
      aria-label={`Play ${track.title}`}
      className="flex justify-center text-sm text-text-subdued"
      disabled={!onPlay}
      onClick={onPlay}
      type="button"
    >
      <span className="group-hover:hidden">{index ?? '•'}</span>
      <Play
        className="hidden text-text group-hover:block"
        fill="currentColor"
        size={14}
      />
    </button>

    <span className="flex min-w-0 items-center gap-3">
      <Image
        alt={track.title}
        className="size-10 shrink-0 rounded object-cover"
        height={40}
        src={getTrackCoverUrl(track.cover)}
        unoptimized
        width={40}
      />
      <span className="min-w-0">
        <span
          className={cn(
            'block truncate text-sm font-medium',
            isActive ? 'text-primary' : 'text-text',
          )}
        >
          {track.title}
        </span>
        <span className="block truncate text-xs text-text-subdued">
          <ArtistName artistId={track.artistId} />
        </span>
      </span>
    </span>

    <span className="flex items-center gap-3">
      <span className="text-sm text-text-subdued">
        {formatDuration(track.duration ?? 0)}
      </span>
      {onRemove ? (
        <button
          aria-label={`Remove ${track.title} from queue`}
          className="rounded-full p-1 text-text-subdued opacity-0 transition hover:bg-white/10 hover:text-text focus-visible:opacity-100 group-hover:opacity-100"
          onClick={onRemove}
          type="button"
        >
          <X size={16} />
        </button>
      ) : null}
    </span>
  </li>
)
