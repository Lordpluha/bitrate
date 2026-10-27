'use client'

import { cn } from '@bitrate/ui-react'
import { ArtistName } from '@entities/Artist'
import {
  selectCurrentPlaylistName,
  selectMusicPlayer,
  selectQueue,
  usePlayerStore,
} from '@entities/Player'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import { MediaImage } from '@shared/ui/MediaImage'
import { formatDuration } from '@shared/utils/apiHelpers'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import Link from 'next/link'

/** How many upcoming tracks the panel lists, as in the design's Up Next. */
const UP_NEXT_LIMIT = 3

const rowClassName = 'group flex h-16.5 items-center gap-3'

/** A track as the player store holds it. */
type QueuedTrack = ReturnType<typeof selectMusicPlayer>['playlist'][number]

type UpNextRowContentProps = {
  track: QueuedTrack
}

/** One Up Next row: cover, title, artist and length. */
const UpNextRowContent = ({ track }: UpNextRowContentProps) => (
  <>
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
  </>
)

/**
 * The Now Playing panel's Up Next: the user queue first, then the rest of the playing context
 * (matching `changeTrack`). As on the queue page, a context track plays from its row and a
 * queued track opens the queue; Clear empties the user queue.
 */
export const NextInQueue = () => {
  const { t } = useI18n()
  const { currentTrack, currentTrackIndex, playlist } =
    usePlayerStore(selectMusicPlayer)
  const queue = usePlayerStore(selectQueue)
  const clearQueue = usePlayerStore((state) => state.clearQueue)
  const playPlaylist = usePlayerStore((state) => state.playPlaylist)
  const currentPlaylistId = usePlayerStore((state) => state.currentPlaylistId)
  const playlistName = usePlayerStore(selectCurrentPlaylistName)

  const contextTracks =
    currentTrackIndex >= 0 ? playlist.slice(currentTrackIndex + 1) : []
  const upNext = [
    ...queue.map((item) => ({
      key: `queue-${item.queueId}`,
      position: null,
      track: item.track,
    })),
    ...contextTracks.map((track, offset) => ({
      key: `context-${track.id}`,
      position: currentTrackIndex + 1 + offset,
      track,
    })),
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
          {t('sidebar.upNext')}
        </h2>
        <div className="flex items-center gap-3">
          {queue.length > 0 ? (
            <button
              className="text-xs text-accent hover:underline"
              onClick={clearQueue}
              type="button"
            >
              {t('common.clear')}
            </button>
          ) : null}
          <Link
            className="text-xs text-accent hover:underline"
            href={ROUTES.queue}
          >
            {t('player.openQueue')}
          </Link>
        </div>
      </div>
      <ul>
        {upNext.map(({ key, position, track }) => (
          <li className="border-b border-border" key={key}>
            {position === null ? (
              <Link className={rowClassName} href={ROUTES.queue}>
                <UpNextRowContent track={track} />
              </Link>
            ) : (
              <button
                aria-label={t('common.playName', { name: track.title })}
                className={cn(rowClassName, 'w-full text-left')}
                onClick={() =>
                  playPlaylist({
                    currentPlaylistId,
                    currentPlaylistName: playlistName,
                    startTrack: track,
                    startTrackIndex: position,
                    tracks: playlist,
                  })
                }
                type="button"
              >
                <UpNextRowContent track={track} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
