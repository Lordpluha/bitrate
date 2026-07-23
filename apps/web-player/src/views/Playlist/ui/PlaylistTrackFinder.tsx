'use client'

import { Search, X } from 'lucide-react'
import Image from 'next/image'
import { useDeferredValue, useMemo, useState } from 'react'
import { type TrackEntity, useTracks } from '@/entities/Track'
import { getTrackCoverUrl } from '@/shared/utils/mediaUrl'

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
    <section className="px-6 pb-10 pt-6">
      <div className="border-t border-white/10 pt-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-text">
            Let's find something for your playlist
          </h2>
          <button
            aria-label="Hide recommendations"
            className="text-text-subdued transition-colors hover:text-text"
            onClick={() => setIsVisible(false)}
            type="button"
          >
            <X size={30} />
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
            placeholder="Search for songs or episodes"
            value={query}
          />
          {query.length > 0 && (
            <button
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subdued hover:text-text"
              onClick={() => setQuery('')}
              type="button"
            >
              <X size={18} />
            </button>
          )}
        </label>

        <div className="mt-5 space-y-1">
          {!shouldSearch && (
            <p className="text-sm text-text-subdued">
              Search tracks and add them to {playlistTitle}.
            </p>
          )}
          {shouldSearch && isFetching && (
            <p className="text-sm text-text-subdued">Searching...</p>
          )}
          {shouldSearch && !isFetching && suggestedTracks.length === 0 && (
            <p className="text-sm text-text-subdued">No tracks found.</p>
          )}
          {suggestedTracks.map((track) => (
            <TrackSearchResult
              addingTrackId={addingTrackId}
              key={track.id}
              onAddTrack={onAddTrack}
              track={track}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

type TrackSearchResultProps = {
  addingTrackId: string | null
  onAddTrack: (track: TrackEntity) => void
  track: TrackEntity
}

const TrackSearchResult = ({
  addingTrackId,
  onAddTrack,
  track,
}: TrackSearchResultProps) => (
  <div className="grid grid-cols-[44px_minmax(0,1.8fr)_minmax(160px,1fr)_auto] items-center gap-3 rounded px-3 py-2 transition-colors hover:bg-white/10 max-[860px]:grid-cols-[44px_minmax(0,1fr)_auto]">
    <Image
      alt={track.title}
      className="h-10 w-10 rounded object-cover"
      height={40}
      src={getTrackCoverUrl(track.cover)}
      unoptimized
      width={40}
    />
    <div className="min-w-0">
      <p className="truncate font-medium text-text">{track.title}</p>
      <p className="truncate text-sm text-text-subdued">{track.artistId}</p>
    </div>
    <p className="truncate text-sm text-text-subdued max-[860px]:hidden">
      {track.title}
    </p>
    <button
      className="rounded-full border border-white/50 px-4 py-1.5 text-sm font-bold text-text transition-colors hover:border-white disabled:cursor-not-allowed disabled:opacity-50"
      disabled={addingTrackId === track.id}
      onClick={() => onAddTrack(track)}
      type="button"
    >
      {addingTrackId === track.id ? 'Adding' : 'Add'}
    </button>
  </div>
)
