'use client'

import type { TrackEntity } from '@entities/Track'
import { FilterChips } from '@shared/ui'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n'
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
  const { t } = useI18n()
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
          {t('artist.discography')}
        </h2>
        {hasOverflow && (
          <button
            className="shrink-0 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setIsExpanded((value) => !value)}
            type="button"
          >
            {isExpanded ? t('common.showLess') : t('common.showAll')}
          </button>
        )}
      </div>
      <FilterChips
        ariaLabel={t('artist.discographyFilters')}
        chips={DISCOGRAPHY_FILTERS.map(({ id, labelKey }) => ({
          id,
          label: t(labelKey),
        }))}
        className="flex-wrap"
        onChange={changeFilter}
        value={activeFilter}
      />
      {visibleReleases.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">
          {t(EMPTY_FILTER_LABELS[activeFilter])}
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
