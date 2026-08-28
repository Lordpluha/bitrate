'use client'

import { ArtistName } from '@entities/Artist'
import {
  selectMusicPlayer,
  selectQueue,
  usePlayerStore,
} from '@entities/Player'
import { ROUTES } from '@shared/routes'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { PlayIcon, Typography } from '@spotify/ui-react'
import Image from 'next/image'
import Link from 'next/link'

export const NextInQueue = () => {
  const { currentTrack, currentTrackIndex, playlist } =
    usePlayerStore(selectMusicPlayer)
  const queue = usePlayerStore(selectQueue)
  const changeTrack = usePlayerStore((state) => state.changeTrack)

  /** The user queue wins over the playing context, matching `changeTrack`. */
  const nextTrack =
    queue[0]?.track ??
    (currentTrackIndex >= 0 && currentTrackIndex < playlist.length - 1
      ? playlist[currentTrackIndex + 1]
      : null)

  if (!currentTrack || !nextTrack) {
    return null
  }

  return (
    <div className="mt-4 overflow-hidden rounded-lg bg-surface p-0">
      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <Typography
          as="p"
          className="text-sm font-semibold text-text"
          size="body"
        >
          Next in queue
        </Typography>
        <Link
          className="p-0 text-xs font-medium text-text-subdued hover:underline"
          href={ROUTES.queue}
        >
          Open queue
        </Link>
      </div>
      <button
        className="group flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
        onClick={() => changeTrack('next')}
        type="button"
      >
        <div className="relative size-12 shrink-0">
          <Image
            alt={nextTrack.title}
            className="rounded-md object-cover"
            fill
            sizes="48px"
            src={getTrackCoverUrl(nextTrack.cover)}
            unoptimized
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <PlayIcon className="size-5 text-white" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <Typography
            as="p"
            className="truncate text-sm text-text transition-colors group-hover:text-primary"
            size="body"
          >
            {nextTrack.title}
          </Typography>
          <Typography
            as="p"
            className="truncate text-xs text-text-subdued"
            size="body"
          >
            <ArtistName artistId={nextTrack.artistId} />
          </Typography>
        </div>
      </button>
    </div>
  )
}
