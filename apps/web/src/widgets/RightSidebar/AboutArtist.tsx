'use client'

import React from 'react'
import { Button, Typography } from '@spotify/ui-react'
import { useAppSelector } from '@shared/hooks'
import { selectCurrentTrack } from '@entities/Player'
import { useArtist } from '@shared/hooks/useArtist'

export const AboutArtist: React.FC = () => {
  const currentTrack = useAppSelector(selectCurrentTrack)
  const { artist, isLoading } = useArtist(currentTrack?.artistId)

  if (!currentTrack || !currentTrack.artistId) {
    return null
  }

  if (isLoading || !artist) {
    return null
  }

  const avatarUrl = artist.avatar?.startsWith('http')
    ? artist.avatar
    : artist.avatar
      ? `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/static/artists/avatars/${artist.avatar}`
      : '/images/default-avatar.jpg'

  const backgroundUrl = artist.backgroundImage?.startsWith('http')
    ? artist.backgroundImage
    : artist.backgroundImage
      ? `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}/static/artists/backgrounds/${artist.backgroundImage}`
      : avatarUrl

  return (
    <div className="relative bg-surface rounded-lg overflow-hidden mt-4">
      <div className="relative">
        <Typography
          as="h6"
          size="heading6"
          className="text-text absolute top-4 left-4 z-10"
        >
          About the artist
        </Typography>
        <img
          src={backgroundUrl}
          alt={artist.username || 'Artist'}
          className="w-full object-cover"
        />
      </div>
      <div className="flex flex-col p-4">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={avatarUrl}
            alt={artist.username || 'Artist'}
            className="w-12 h-12 rounded-full object-cover"
          />
          <Typography
            as="h6"
            size="heading6"
            className="text-text font-semibold text-base"
          >
            {artist.username || 'Unknown Artist'}
          </Typography>
        </div>
        {artist.bio && (
          <Typography
            as="p"
            size="body"
            className="text-grey-500 text-xs mt-2 line-clamp-3"
          >
            {artist.bio}
          </Typography>
        )}
      </div>
    </div>
  )
}
