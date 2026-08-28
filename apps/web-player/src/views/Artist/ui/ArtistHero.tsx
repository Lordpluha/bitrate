'use client'

import { getArtistBackgroundUrl } from '@shared/utils/mediaUrl'
import { BadgeCheck } from 'lucide-react'
import Image from 'next/image'
import type { ArtistHeroProps } from '@/views/Artist/model/artist.types'

/** Full-bleed artist header matching Spotify's desktop artist treatment. */
export const ArtistHero = ({ artist, statsLabel }: ArtistHeroProps) => {
  const backgroundUrl = getArtistBackgroundUrl(
    artist.backgroundImage,
    artist.avatar,
  )

  return (
    <section
      aria-labelledby="artist-page-title"
      className="relative isolate flex h-[clamp(19rem,46vh,25rem)] min-h-76 flex-col justify-end overflow-hidden"
    >
      <Image
        alt=""
        className="-z-20 object-cover object-center"
        fill
        priority
        sizes="100vw"
        src={backgroundUrl}
        unoptimized
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/5 via-black/10 to-black/80" />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/30 via-transparent to-transparent" />

      <div className="flex flex-col px-5 pb-7 sm:px-6">
        <h1
          className="max-w-full break-words text-[clamp(3.25rem,6vw,6rem)] font-black leading-[0.95] tracking-[-0.045em] text-white drop-shadow-sm"
          id="artist-page-title"
        >
          {artist.username}
        </h1>
        {artist.verified ? (
          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-white">
            <BadgeCheck
              aria-hidden="true"
              className="fill-green-100 text-green-900"
              size={22}
            />
            <span>Verified artist</span>
          </div>
        ) : null}
        <p className="mt-2 text-sm text-white/90">{statsLabel}</p>
      </div>
    </section>
  )
}
