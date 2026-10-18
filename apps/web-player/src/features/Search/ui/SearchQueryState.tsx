import { StateMessage, TrackRowSkeleton } from '@shared/ui'
import { SearchX, TriangleAlert } from 'lucide-react'
import type { SafeUser } from '@/entities/User'
import type { WebPlayerSearchResults } from '@/features/Search/api/client'
import type { MediaCardItem } from '@/features/Search/model/types'
import { SearchResults } from '@/features/Search/ui/SearchResults'
import { ErrorState } from '@/shared/ui/ErrorState'

/** Rows standing in for results while the first search runs. */
const SKELETON_KEYS = Array.from(
  { length: 8 },
  (_, row) => `search-skeleton-${row}`,
)

type SearchQueryStateProps = {
  data: Pick<
    WebPlayerSearchResults,
    'albums' | 'artists' | 'playlists' | 'topResult' | 'tracks'
  >
  hasError: boolean
  isFetching: boolean
  onPlayItem?: (item: MediaCardItem) => void
  onRetry: () => void
  query: string
  users: SafeUser[]
}

export const SearchQueryState = ({
  data,
  hasError,
  isFetching,
  onPlayItem,
  onRetry,
  query,
  users,
}: SearchQueryStateProps) => {
  const albums = data.albums ?? []
  const artists = data.artists ?? []
  const playlists = data.playlists ?? []
  const tracks = data.tracks ?? []
  const hasResults =
    tracks.length > 0 ||
    artists.length > 0 ||
    albums.length > 0 ||
    playlists.length > 0 ||
    users.length > 0

  if (isFetching && !hasResults) {
    return (
      <div aria-label="Searching" className="flex flex-col gap-1" role="status">
        <span className="sr-only">Searching...</span>
        {SKELETON_KEYS.map((key) => (
          <TrackRowSkeleton key={key} />
        ))}
      </div>
    )
  }

  if (hasError && !hasResults) {
    return (
      <ErrorState
        description="Something went wrong while searching. Try again in a moment."
        onRetry={onRetry}
        title="Search is unavailable"
      />
    )
  }

  if (!hasResults) {
    return (
      <StateMessage
        description="Please make sure your words are spelled correctly, or use fewer or different keywords."
        icon={SearchX}
        title={`No results found for "${query}"`}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {hasError ? (
        <div
          className="flex flex-wrap items-center gap-2.5 rounded-[10px] border border-warning-border bg-warning-surface px-4 py-3 text-[13px] text-warning-text"
          role="alert"
        >
          <TriangleAlert aria-hidden="true" className="shrink-0" size={16} />
          <span className="min-w-0 flex-1">
            Some result types could not be loaded. The rest will appear when the
            service recovers.
          </span>
          <button
            className="font-semibold underline hover:no-underline"
            onClick={onRetry}
            type="button"
          >
            Try again
          </button>
        </div>
      ) : null}
      <SearchResults
        albums={albums}
        artists={artists}
        onPlayItem={onPlayItem}
        playlists={playlists}
        query={query}
        topResult={data.topResult}
        tracks={tracks}
        users={users}
      />
    </div>
  )
}
