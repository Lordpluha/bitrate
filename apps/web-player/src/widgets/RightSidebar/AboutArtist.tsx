'use client'

import { selectCurrentTrack } from '@entities/Player'
import { useAppSelector } from '@shared/hooks'
import { useArtist } from '@shared/hooks/useArtist'
import { Button, Typography } from '@spotify/ui-react'
import type React from 'react'

export const AboutArtist: React.FC = () => {
  const currentTrack = useAppSelector(selectCurrentTrack)
  const { data: artist, isLoading } = useArtist(currentTrack?.artistId)

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
          className="text-text absolute top-4 left-4 z-10"
          size="heading6"
        >
          About the artist
        </Typography>
        <img
          alt={artist.username || 'Artist'}
          className="w-full object-cover"
          src={backgroundUrl}
        />
      </div>
      <div className="flex flex-col p-4">
        <div className="flex items-center gap-3 mb-2">
          <img
            alt={artist.username || 'Artist'}
            className="w-12 h-12 rounded-full object-cover"
            src={avatarUrl}
          />
          <Typography
            as="h6"
            className="text-text font-semibold text-base"
            size="heading6"
          >
            {artist.username || 'Unknown Artist'}
          </Typography>
        </div>
        {artist.bio && (
          <Typography
            as="p"
            className="text-grey-500 text-xs mt-2 line-clamp-3"
            size="body"
          >
            {artist.bio}
          </Typography>
        )}
      </div>
    </div>
  )
}
