'use client'

import { selectCurrentTrack, usePlayerStore } from '@entities/Player'
import { useArtist } from '@shared/hooks/useArtist'
import {
  getArtistAvatarUrl,
  getArtistBackgroundUrl,
} from '@shared/utils/mediaUrl'
import { Typography } from '@spotify/ui-react'
import Image from 'next/image'

export const AboutArtist = () => {
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const { data: artist, isLoading } = useArtist(currentTrack?.artistId)

  if (!currentTrack?.artistId) {
    return null
  }

  if (isLoading || !artist) {
    return null
  }

  const avatarUrl = getArtistAvatarUrl(artist.avatar)
  const backgroundUrl = getArtistBackgroundUrl(
    artist.backgroundImage,
    artist.avatar,
  )

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
        <div className="relative w-full aspect-square">
          <Image
            alt={artist.username || 'Artist'}
            className="object-cover"
            fill
            sizes="320px"
            src={backgroundUrl}
            unoptimized
          />
        </div>
      </div>
      <div className="flex flex-col p-4">
        <div className="flex items-center gap-3 mb-2">
          <Image
            alt={artist.username || 'Artist'}
            className="w-12 h-12 rounded-full object-cover"
            height={48}
            src={avatarUrl}
            unoptimized
            width={48}
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
