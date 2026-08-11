'use client'

import { getArtistBackgroundUrl } from '@shared/utils/mediaUrl'
import Image from 'next/image'

export type ArtistAboutProps = {
  artist: {
    avatar: string | null
    backgroundImage: string | null
    bio: string | null
    username: string
  }
  statsLabel: string
}

/** "About" card with the artist's portrait and biography. */
export const ArtistAbout = ({ artist, statsLabel }: ArtistAboutProps) => {
  if (!artist.bio) return null

  return (
    <section className="px-4 pb-10 sm:px-6">
      <h2 className="mb-4 text-2xl font-bold text-text">About</h2>

      <div className="overflow-hidden rounded-xl bg-surface">
        <div className="relative aspect-[16/7] w-full sm:aspect-[16/5]">
          <Image
            alt={artist.username}
            className="object-cover"
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            src={getArtistBackgroundUrl(artist.backgroundImage, artist.avatar)}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <p className="absolute bottom-4 left-4 text-sm font-semibold text-white">
            {statsLabel}
          </p>
        </div>
        <p className="whitespace-pre-line p-5 text-sm leading-6 text-text-subdued sm:p-6">
          {artist.bio}
        </p>
      </div>
    </section>
  )
}
