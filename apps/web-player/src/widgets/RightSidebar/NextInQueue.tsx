'use client'

import { ArtistName } from '@entities/Artist'
import {
  selectMusicPlayer,
  selectQueue,
  usePlayerStore,
} from '@entities/Player'
import { ROUTES } from '@shared/routes'
import { MediaImage } from '@shared/ui/MediaImage'
import { formatDuration } from '@shared/utils/apiHelpers'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import Link from 'next/link'

/** How many upcoming tracks the panel lists, as in the design's Up Next. */
const UP_NEXT_LIMIT = 3

/**
 * The Now Playing panel's Up Next: the user queue first, then the rest of the playing context
 * (matching `changeTrack`). Each row opens the full queue; Clear empties the user queue.
 */
export const NextInQueue = () => {
  const { currentTrack, currentTrackIndex, playlist } =
    usePlayerStore(selectMusicPlayer)
  const queue = usePlayerStore(selectQueue)
  const clearQueue = usePlayerStore((state) => state.clearQueue)

  const contextTracks =
    currentTrackIndex >= 0 ? playlist.slice(currentTrackIndex + 1) : []
  const upNext = [
    ...queue.map((item) => ({
      key: `queue-${item.queueId}`,
      track: item.track,
    })),
    ...contextTracks.map((track) => ({ key: `context-${track.id}`, track })),
  ].slice(0, UP_NEXT_LIMIT)

  if (!currentTrack || upNext.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="up-next-title" className="flex flex-col">
      <div className="flex h-7.5 items-center justify-between">
        <h2
          className="text-xs font-semibold text-foreground uppercase"
          id="up-next-title"
        >
          Up next
        </h2>
        {queue.length > 0 ? (
          <button
            className="text-xs text-accent hover:underline"
            onClick={clearQueue}
            type="button"
          >
            Clear
          </button>
        ) : (
          <Link
            className="text-xs text-accent hover:underline"
            href={ROUTES.queue}
          >
            Open queue
          </Link>
        )}
      </div>
      <ul>
        {upNext.map(({ key, track }) => (
          <li className="border-b border-border" key={key}>
            <Link
              className="group flex h-16.5 items-center gap-3"
              href={ROUTES.queue}
            >
              <MediaImage
                alt=""
                className="size-12 shrink-0 rounded-md object-cover"
                fallback="track"
                height={48}
                src={getTrackCoverUrl(track.cover)}
                unoptimized
                width={48}
              />
              <span className="flex min-w-0 flex-1 flex-col gap-1.25">
                <span className="truncate text-[13px] font-semibold text-foreground group-hover:text-primary">
                  {track.title}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  <ArtistName artistId={track.artistId} />
                </span>
              </span>
              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                {formatDuration(track.duration ?? 0)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
