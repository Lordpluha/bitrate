'use client'

import { MediaImage } from '@shared/ui/MediaImage'
import { getArtistBackgroundUrl } from '@shared/utils/mediaUrl'
import { BadgeCheck } from 'lucide-react'
import type { ArtistHeroProps } from '@/views/Artist/model/artist.types'

/** Full-bleed artist header: cover art, name, and the primary listen action. */
export const ArtistHero = ({ artist, statsLabel }: ArtistHeroProps) => {
  const backgroundUrl = getArtistBackgroundUrl(
    artist.backgroundImage,
    artist.avatar,
  )

  return (
    <section
      aria-labelledby="artist-page-title"
      className="relative isolate flex h-65 flex-col justify-end gap-1 overflow-hidden rounded-[14px] p-4 md:h-80 md:gap-2 md:rounded-2xl md:p-8"
    >
      <MediaImage
        alt=""
        className="-z-20 object-cover object-center"
        fallback="artist"
        fill
        priority
        sizes="100vw"
        src={backgroundUrl}
        unoptimized
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/0 via-black/15 to-black/75" />

      {artist.verified ? (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white md:text-[13px]">
          <BadgeCheck
            aria-hidden="true"
            className="size-4 text-info md:size-5"
          />
          <span>Verified artist</span>
        </div>
      ) : null}
      <h1
        className="max-w-full break-words text-[40px] leading-[1.05] font-bold text-white drop-shadow-sm md:text-[80px] md:leading-none"
        id="artist-page-title"
      >
        {artist.username}
      </h1>
      <p className="text-[13px] text-white md:text-sm">{statsLabel}</p>
    </section>
  )
}
