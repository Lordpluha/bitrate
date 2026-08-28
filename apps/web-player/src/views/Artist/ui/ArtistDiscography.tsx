'use client'

import type { TrackEntity } from '@entities/Track'
import { cn } from '@spotify/ui-react'
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
    <section className="px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-text">Discography</h2>
        {hasOverflow && (
          <button
            className="shrink-0 rounded-sm text-sm font-bold text-text-subdued transition-colors hover:text-text"
            onClick={() => setIsExpanded((value) => !value)}
            type="button"
          >
            {isExpanded ? 'Show less' : 'Show all'}
          </button>
        )}
      </div>
      <fieldset className="mb-6 flex min-w-0 flex-wrap gap-2 border-0 p-0">
        <legend className="sr-only">Discography filters</legend>
        {DISCOGRAPHY_FILTERS.map((filter) => (
          <button
            aria-pressed={activeFilter === filter.id}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              activeFilter === filter.id
                ? 'bg-text text-background'
                : 'bg-surface text-text hover:bg-surface-hover',
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
        <p className="py-10 text-sm text-text-subdued">
          {EMPTY_FILTER_LABELS[activeFilter]}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
