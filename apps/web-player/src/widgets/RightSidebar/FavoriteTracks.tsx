'use client'

import React from 'react'
import { Typography } from '@spotify/ui-react'
import { SavedSongIcon } from '@spotify/ui-react'
import { useAppSelector } from '@shared/hooks'
import { selectCurrentTrack } from '@entities/Player'

export const CurrentPlaylist: React.FC = () => {
  const currentTrack = useAppSelector(selectCurrentTrack)

  if (!currentTrack) {
    return null
  }

  const coverUrl = currentTrack.cover?.startsWith('http')
    ? currentTrack.cover
    : `${process.env.NEXT_PUBLIC_API_URL}${currentTrack.cover}`

  return (
    <div>
      <Typography as="h6" size="heading6" className="text-text">
        Now Playing
      </Typography>
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
              {currentTrack.artistId || 'Unknown Artist'}
            </Typography>
            <SavedSongIcon />
          </div>
        </div>
      </div>
    </div>
  )
}
