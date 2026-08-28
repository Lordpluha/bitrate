'use client'

import type { TrackEntity } from '@entities/Track'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { PlayIcon } from '@spotify/ui-react'
import Image from 'next/image'

export type ArtistFeaturingProps = {
  artistName: string
  artistImageUrl: string
  tracks: TrackEntity[]
  onPlayAll: () => void
  onShuffle: () => void
  onPlayTrack: (track: TrackEntity, index: number) => void
}

type FeaturingCard = {
  description: string
  id: string
  imageAlt: string
  imageUrl: string
  onClick: () => void
  title: string
}

export const ArtistFeaturing = ({
  artistImageUrl,
  artistName,
  onPlayAll,
  onPlayTrack,
  onShuffle,
  tracks,
}: ArtistFeaturingProps) => {
  if (tracks.length === 0) return null

  const cards: FeaturingCard[] = [
    {
      description: `The essential tracks from ${artistName}, all in one place.`,
      id: 'this-is',
      imageAlt: `${artistName} artist portrait`,
      imageUrl: artistImageUrl,
      onClick: onPlayAll,
      title: `This Is ${artistName}`,
    },
    {
      description: `A shuffled mix led by ${artistName}.`,
      id: 'radio',
      imageAlt: `${artistName} artist portrait`,
      imageUrl: artistImageUrl,
      onClick: onShuffle,
      title: `${artistName} Radio`,
    },
    ...tracks.slice(0, 2).map<FeaturingCard>((track, originalIndex) => ({
      description: `${artistName} · Popular track`,
      id: `track-${track.id}`,
      imageAlt: `${track.title} cover`,
      imageUrl: getTrackCoverUrl(track.cover),
      onClick: () => onPlayTrack(track, originalIndex),
      title: track.title,
    })),
  ]

  return (
    <section className="px-4 pb-10 pt-10 sm:px-6">
      <h2 className="mb-2 text-2xl font-bold text-text">
        Featuring {artistName}
      </h2>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <li className="min-w-0" key={card.id}>
            <button
              aria-label={`Play ${card.title}`}
              className="group/card block w-full rounded-lg p-3 text-left transition-colors hover:bg-surface focus:outline-none focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-white"
              onClick={card.onClick}
              type="button"
            >
              <span className="relative mb-3 block aspect-square overflow-hidden rounded-md bg-surface shadow-lg shadow-black/20">
                <Image
                  alt={card.imageAlt}
                  className="object-cover transition duration-300 group-hover/card:scale-[1.03] group-hover/card:brightness-75 group-focus-visible/card:scale-[1.03] group-focus-visible/card:brightness-75"
                  fill
                  sizes="(max-width: 767px) 45vw, (max-width: 1279px) 30vw, 220px"
                  src={card.imageUrl}
                  unoptimized
                />

                <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 group-focus-visible/card:opacity-100" />
                <span className="absolute bottom-2 right-2 flex translate-y-2 scale-95 opacity-0 transition duration-300 group-hover/card:translate-y-0 group-hover/card:scale-100 group-hover/card:opacity-100 group-focus-visible/card:translate-y-0 group-focus-visible/card:scale-100 group-focus-visible/card:opacity-100">
                  <PlayIcon height={48} width={48} />
                </span>
              </span>

              <span className="mb-1 block truncate text-sm font-semibold text-text">
                {card.title}
              </span>
              <span className="line-clamp-2 block text-xs leading-5 text-text-subdued">
                {card.description}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
