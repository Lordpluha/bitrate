'use client'

import {
  selectCurrentPlaylistName,
  selectCurrentTrack,
  usePlayerStore,
} from '@entities/Player'
import { useArtist } from '@shared/hooks/useArtist'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { RollupIcon, SavedSongIcon, Typography } from '@spotify/ui-react'
import Image from 'next/image'
import { useState } from 'react'

type CurrentPlaylistProps = {
  onCollapse?: () => void
}

export const CurrentPlaylist = ({ onCollapse }: CurrentPlaylistProps) => {
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const playlistName = usePlayerStore(selectCurrentPlaylistName)
  const { data: artist } = useArtist(currentTrack?.artistId)
  const artistName = artist?.username || 'Unknown Artist'
  const [isIconHovered, setIsIconHovered] = useState(false)

  if (!currentTrack) {
    return null
  }

  const coverUrl = getTrackCoverUrl(currentTrack.cover)

  return (
    <div>
      <div className="flex items-center mb-1">
        {onCollapse && (
          <button
            aria-label="Collapse sidebar"
            className="w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100 touch:w-auto touch:opacity-100 transition-all duration-200 overflow-hidden p-1 hover:bg-surface rounded mr-2"
            onClick={onCollapse}
            onMouseEnter={() => setIsIconHovered(true)}
            onMouseLeave={() => setIsIconHovered(false)}
            type="button"
          >
            <RollupIcon
              height={16}
              primaryColor={isIconHovered ? '#ffffff' : '#b3b3b3'}
              width={16}
            />
          </button>
        )}
        <Typography as="h6" className="text-text" size="heading6">
          {playlistName || 'Current queue'}
        </Typography>
      </div>
      <div className="flex flex-col items-center pb-2 mt-1">
        <div className="relative w-full aspect-square mb-2">
          <Image
            alt={currentTrack.title}
            className="rounded-md object-cover"
            fill
            sizes="320px"
            src={coverUrl}
            unoptimized
          />
        </div>
        <div className="w-full">
          <Typography as="p" className="text-grey-500 truncate" size="body">
            {currentTrack.title}
          </Typography>
          <div className="flex justify-between items-center gap-2">
            <Typography
              as="p"
              className="text-green-500 truncate flex-1"
              size="body"
            >
              {artistName}
            </Typography>
            <SavedSongIcon />
          </div>
        </div>
      </div>
    </div>
  )
}
