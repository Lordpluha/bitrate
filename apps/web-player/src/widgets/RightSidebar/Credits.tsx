'use client'

import { Typography } from '@bitrate/ui-react'
import { FollowArtistButton, useArtist } from '@entities/Artist'
import { selectCurrentTrack, usePlayerStore } from '@entities/Player'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'

/**
 * Credits for the playing track.
 * The API exposes a single artist per track, so only the main artist row is shown.
 */
export const Credits = () => {
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const { data: artist } = useArtist(currentTrack?.artistId)

  if (!currentTrack?.artistId || !artist) return null

  return (
    <div className="mt-4 overflow-hidden rounded-lg bg-surface p-0">
      <div className="px-4 pb-1 pt-3">
        <Typography as="h6" className="text-text" size="heading6">
          Credits
        </Typography>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 pb-4">
        <div className="min-w-0">
          <Link
            className="block truncate text-sm text-text hover:underline"
            href={ROUTES.artist(artist.id)}
          >
            {artist.username}
          </Link>
          <Typography as="p" className="text-xs text-text-subdued" size="body">
            Main Artist
          </Typography>
        </div>
        <FollowArtistButton
          artistId={artist.id}
          artistName={artist.username}
          size="sm"
        />
      </div>
    </div>
  )
}
