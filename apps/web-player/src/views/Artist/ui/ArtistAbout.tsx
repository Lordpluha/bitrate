'use client'

import { cn } from '@bitrate/ui-react'
import { getArtistBackgroundUrl } from '@shared/utils/mediaUrl'
import Image from 'next/image'
import { useState } from 'react'

export type ArtistAboutProps = {
  artist: {
    avatar: string | null
    backgroundImage: string | null
    bio: string | null
    username: string
  }
  statsLabel: string
}

/**
 * "About" card: the artist's portrait with the listener count and biography
 * laid over it, matching how the real product presents this block.
 */
export const ArtistAbout = ({ artist, statsLabel }: ArtistAboutProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!artist.bio) return null

  return (
    <section className="px-4 pb-10 sm:px-6">
      <h2 className="mb-4 text-2xl font-bold text-text">About</h2>

      <div className="relative overflow-hidden rounded-xl bg-surface">
        <Image
          alt={artist.username}
          className="object-cover"
          fill
          sizes="(max-width: 1024px) 100vw, 900px"
          src={getArtistBackgroundUrl(artist.backgroundImage, artist.avatar)}
          unoptimized
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />

        {/* In flow, so a long expanded biography grows the card instead of being clipped by it. */}
        <div className="relative flex min-h-72 flex-col justify-end p-5 sm:min-h-96 sm:p-6">
          <p className="text-sm font-bold text-white sm:text-base">
            {statsLabel}
          </p>
          <p
            className={cn(
              'mt-2 max-w-2xl whitespace-pre-line text-sm leading-6 text-white/80',
              !isExpanded && 'line-clamp-3',
            )}
          >
            {artist.bio}
          </p>
          <button
            aria-expanded={isExpanded}
            className="mt-2 text-xs font-bold uppercase tracking-wide text-white/70 transition-colors hover:text-white"
            onClick={() => setIsExpanded((previous) => !previous)}
            type="button"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      </div>
    </section>
  )
}
