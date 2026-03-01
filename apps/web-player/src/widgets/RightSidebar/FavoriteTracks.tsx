'use client'

import { selectCurrentTrack } from '@entities/Player'
import { useAppSelector } from '@shared/hooks'
import { SavedSongIcon, Typography } from '@spotify/ui-react'
import type React from 'react'

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
      <Typography as="h6" className="text-text" size="heading6">
        Now Playing
      </Typography>
      <div className="flex flex-col items-center pb-2 mt-1">
        <img
          alt={currentTrack.title}
          className="w-full rounded-md mb-2 object-cover"
          src={coverUrl}
        />
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
              {currentTrack.artistId || 'Unknown Artist'}
            </Typography>
            <SavedSongIcon />
          </div>
        </div>
      </div>
    </div>
  )
}
