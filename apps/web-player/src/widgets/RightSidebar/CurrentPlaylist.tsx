'use client'

import { RollupIcon, SavedSongIcon, Typography } from '@bitrate/ui-react'
import { useArtist } from '@entities/Artist'
import {
  selectCurrentPlaylistName,
  selectCurrentTrack,
  usePlayerStore,
} from '@entities/Player'
import { ROUTES } from '@shared/routes'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import Image from 'next/image'
import Link from 'next/link'

type CurrentPlaylistProps = {
  onCollapse?: () => void
}

export const CurrentPlaylist = ({ onCollapse }: CurrentPlaylistProps) => {
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const playlistName = usePlayerStore(selectCurrentPlaylistName)
  const { data: artist } = useArtist(currentTrack?.artistId)
  const artistName = artist?.username || 'Unknown Artist'

  if (!currentTrack) {
    return null
  }

  const coverUrl = getTrackCoverUrl(currentTrack.cover)

  return (
    <div>
      <div className="mb-5 flex items-center">
        {onCollapse && (
          <button
            aria-label="Collapse sidebar"
            className="mr-2 w-0 overflow-hidden rounded p-1 text-text-subdued opacity-0 transition-all duration-200 hover:bg-surface hover:text-text group-hover/sidebar:w-auto group-hover/sidebar:opacity-100 touch:w-auto touch:opacity-100"
            onClick={onCollapse}
            type="button"
          >
            <RollupIcon height={16} primaryColor="currentColor" width={16} />
          </button>
        )}
        <Typography as="h6" className="text-text" size="heading6">
          {playlistName || 'Current queue'}
        </Typography>
      </div>
      <div className="flex flex-col items-center pb-2">
        <div className="relative mb-4 aspect-square w-full">
          <Image
            alt={currentTrack.title}
            className="rounded-md object-cover"
            fill
            priority
            sizes="320px"
            src={coverUrl}
            unoptimized
          />
        </div>
        <div className="w-full">
          <p className="truncate text-2xl font-bold leading-tight text-text">
            {currentTrack.title}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <Link
              className="flex-1 truncate text-sm text-text-subdued transition-colors hover:text-text hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text"
              href={ROUTES.artist(currentTrack.artistId)}
            >
              {artistName}
            </Link>
            <SavedSongIcon />
          </div>
        </div>
      </div>
    </div>
  )
}
