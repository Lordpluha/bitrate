'use client'

import React, { useState } from 'react'
import { Typography, RollupIcon } from '@spotify/ui-react'
import { SavedSongIcon } from '@spotify/ui-react'
import { useAppSelector } from '@shared/hooks'
import { selectCurrentTrack, selectCurrentPlaylistName } from '@entities/Player'
import { useArtist } from '@shared/hooks/useArtist'

export const CurrentPlaylist: React.FC<{ onCollapse?: () => void }> = ({ onCollapse }) => {
  const currentTrack = useAppSelector(selectCurrentTrack)
  const playlistName = useAppSelector(selectCurrentPlaylistName)
  const { artist } = useArtist(currentTrack?.artistId)
  const artistName = artist?.username || artist?.name || 'Unknown Artist'
  const [isIconHovered, setIsIconHovered] = useState(false)

  if (!currentTrack) {
    return null
  }

  const coverUrl = currentTrack.cover?.startsWith('http')
    ? currentTrack.cover
    : `${process.env.NEXT_PUBLIC_API_URL}${currentTrack.cover}`

  return (
    <div>
      <div className="flex items-center mb-1">
        {onCollapse && (
          <button
            onClick={onCollapse}
            onMouseEnter={() => setIsIconHovered(true)}
            onMouseLeave={() => setIsIconHovered(false)}
            className="w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100 transition-all duration-200 overflow-hidden p-1 hover:bg-gray-700/50 rounded mr-2"
            aria-label="Collapse sidebar"
          >
            <RollupIcon 
              width={16} 
              height={16} 
              primaryColor={isIconHovered ? '#ffffff' : '#b3b3b3'} 
            />
          </button>
        )}
        <Typography as="h6" size="heading6" className="text-text">
          {playlistName || 'Current queue'}
        </Typography>
      </div>
      <div className="flex flex-col items-center pb-2 mt-1">
        <img
          src={coverUrl}
          alt={currentTrack.title}
          className="w-full rounded-md mb-2 object-cover"
        />
        <div className="w-full">
          <Typography as="p" size="body" className="text-grey-500 truncate">
            {currentTrack.title}
          </Typography>
          <div className="flex justify-between items-center gap-2">
            <Typography
              as="p"
              size="body"
              className="text-green-500 truncate flex-1"
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
