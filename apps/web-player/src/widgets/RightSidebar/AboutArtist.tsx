'use client'

import { FollowArtistButton, useArtist } from '@entities/Artist'
import { selectCurrentTrack, usePlayerStore } from '@entities/Player'
import { ROUTES } from '@shared/routes'
import { getArtistBackgroundUrl } from '@shared/utils/mediaUrl'
import { BadgeCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  getNcsArtistBioPrefix,
  parseNcsArtistBioLink,
} from './model/ncsArtistBio'

export const AboutArtist = () => {
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const { data: artist, isLoading } = useArtist(currentTrack?.artistId)

  if (!currentTrack?.artistId) {
    return null
  }

  if (isLoading || !artist) {
    return null
  }

  const backgroundUrl = getArtistBackgroundUrl(
    artist.backgroundImage,
    artist.avatar,
  )
  const ncsBioLink = artist.bio ? parseNcsArtistBioLink(artist.bio) : null
  const ncsBioPrefix = getNcsArtistBioPrefix()

  return (
    <div className="mt-4 overflow-hidden rounded-lg bg-surface">
      <Link
        aria-label={`Open ${artist.username} artist page`}
        className="group block rounded-t-lg outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-text"
        href={ROUTES.artist(artist.id)}
      >
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          <Image
            alt=""
            className="object-cover transition duration-300 group-hover:scale-[1.02] group-hover:brightness-90"
            fill
            priority
            sizes="(max-width: 1279px) 100vw, 320px"
            src={backgroundUrl}
            unoptimized
          />
          <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/25" />
          <h2 className="absolute left-4 top-4 z-10 text-sm font-bold text-white drop-shadow-md">
            About the artist
          </h2>
        </div>
      </Link>

      <div className="p-4">
        <Link
          className="group/name flex w-fit max-w-full items-center gap-1.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-text"
          href={ROUTES.artist(artist.id)}
        >
          <span className="truncate text-sm font-bold text-text group-hover/name:underline">
            {artist.username || 'Unknown Artist'}
          </span>
          {artist.verified ? (
            <BadgeCheck
              aria-hidden="true"
              className="shrink-0 fill-green-100 text-green-900"
              size={16}
            />
          ) : null}
        </Link>

        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="line-clamp-3 min-w-0 text-xs leading-relaxed text-text-subdued">
            {ncsBioLink ? (
              <>
                {ncsBioPrefix}{' '}
                <a
                  className="font-medium text-text underline decoration-text-subdued underline-offset-2 transition-colors hover:text-green-500 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text"
                  href={ncsBioLink.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {ncsBioLink.path}
                </a>
              </>
            ) : (
              artist.bio || 'Artist profile'
            )}
          </p>

          <FollowArtistButton
            artistId={artist.id}
            artistName={artist.username}
            className="shrink-0"
            size="sm"
          />
        </div>
      </div>
    </div>
  )
}
