'use client'

import { cn } from '@bitrate/ui-react'
import type { TrackEntity } from '@entities/Track'
import { useState } from 'react'
import type { ArtistAlbum } from '../model/artist.types'
import {
  COLLAPSED_RELEASE_COUNT,
  DISCOGRAPHY_FILTERS,
  type DiscographyFilter,
  EMPTY_FILTER_LABELS,
  getDiscographyReleases,
} from '../model/artistDiscography'
import { ArtistAlbumCard, ArtistSingleCard } from './ArtistReleaseCard'

export type ArtistDiscographyProps = {
  albums: ArtistAlbum[]
  tracks: TrackEntity[]
  onPlayTrack: (track: TrackEntity, index: number) => void
}

export const ArtistDiscography = ({
  albums,
  tracks,
  onPlayTrack,
}: ArtistDiscographyProps) => {
  const [activeFilter, setActiveFilter] = useState<DiscographyFilter>('popular')
  const [isExpanded, setIsExpanded] = useState(false)
  const releases = getDiscographyReleases(albums, tracks)[activeFilter]
  const hasOverflow = releases.length > COLLAPSED_RELEASE_COUNT
  const visibleReleases = isExpanded
    ? releases
    : releases.slice(0, COLLAPSED_RELEASE_COUNT)

  const changeFilter = (filter: DiscographyFilter) => {
    setActiveFilter(filter)
    setIsExpanded(false)
  }

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[19px] leading-[1.25] font-semibold">
          Discography
        </h2>
        {hasOverflow && (
          <button
            className="shrink-0 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setIsExpanded((value) => !value)}
            type="button"
          >
            {isExpanded ? 'Show less' : 'Show all'}
          </button>
        )}
      </div>
      <fieldset className="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0">
        <legend className="sr-only">Discography filters</legend>
        {DISCOGRAPHY_FILTERS.map((filter) => (
          <button
            aria-pressed={activeFilter === filter.id}
            className={cn(
              'flex h-8 items-center rounded-full border px-3.5 text-[13px] text-foreground transition-colors',
              activeFilter === filter.id
                ? 'border-primary bg-primary font-semibold text-primary-foreground'
                : 'border-border hover:bg-surface',
            )}
            key={filter.id}
            onClick={() => changeFilter(filter.id)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </fieldset>
      {visibleReleases.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">
          {EMPTY_FILTER_LABELS[activeFilter]}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3">
          {visibleReleases.map((release) => (
            <li className="min-w-0" key={release.id}>
              {release.kind === 'album' ? (
                <ArtistAlbumCard release={release} />
              ) : (
                <ArtistSingleCard onPlayTrack={onPlayTrack} release={release} />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
