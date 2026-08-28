'use client'

import { Search, X } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { type TrackEntity, useTracks } from '@/entities/Track'
import { useI18n } from '@/shared/i18n'
import { PlaylistTrackSearchResult } from './PlaylistTrackSearchResult'

type PlaylistTrackFinderProps = {
  addingTrackId: string | null
  existingTrackIds: Set<string>
  onAddTrack: (track: TrackEntity) => void
  playlistTitle: string
}

export const PlaylistTrackFinder = ({
  addingTrackId,
  existingTrackIds,
  onAddTrack,
  playlistTitle,
}: PlaylistTrackFinderProps) => {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [isVisible, setIsVisible] = useState(true)
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim()
  const shouldSearch = normalizedQuery.length > 1
  const { data: tracks = [], isFetching } = useTracks(
    { limit: 5, title: normalizedQuery },
    { enabled: shouldSearch },
  )
  const normalizedTracks = Array.isArray(tracks) ? tracks : []
  const suggestedTracks = useMemo(
    () => normalizedTracks.filter((track) => !existingTrackIds.has(track.id)),
    [existingTrackIds, normalizedTracks],
  )

  if (!isVisible) return null

  return (
    <section className="px-4 pb-10 pt-5 sm:px-6 sm:pt-6">
      <div className="border-t border-white/10 pt-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-text sm:text-2xl">
            {t('playlist.find')}
          </h2>
          <button
            aria-label={t('playlist.hideRecommendations')}
            className="text-text-subdued transition-colors hover:text-text"
            onClick={() => setIsVisible(false)}
            type="button"
          >
            <X className="h-6 w-6 sm:h-7.5 sm:w-7.5" />
          </button>
        </div>
        <label className="relative block max-w-100">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subdued"
            size={18}
          />
          <input
            className="h-10 w-full rounded bg-surface py-2 pl-10 pr-10 text-sm text-text outline-none transition-colors placeholder:text-text-subdued focus:bg-surface-hover focus:ring-2 focus:ring-white/20"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('playlist.search')}
            value={query}
          />
          {query.length > 0 && (
            <button
              aria-label={t('common.clear')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subdued hover:text-text"
              onClick={() => setQuery('')}
              type="button"
            >
              <X size={18} />
            </button>
          )}
        </label>

        <div aria-live="polite" className="mt-5">
          {!shouldSearch && (
            <p className="text-sm text-text-subdued">
              {t('playlist.findHint', { name: playlistTitle })}
            </p>
          )}
          {shouldSearch && isFetching && (
            <p className="text-sm text-text-subdued">{t('search.searching')}</p>
          )}
          {shouldSearch && !isFetching && suggestedTracks.length === 0 && (
            <p className="text-sm text-text-subdued">
              {t('playlist.noTracksFound')}
            </p>
          )}
          <ul className="space-y-1">
            {suggestedTracks.map((track) => (
              <PlaylistTrackSearchResult
                addingTrackId={addingTrackId}
                key={track.id}
                onAddTrack={onAddTrack}
                track={track}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
