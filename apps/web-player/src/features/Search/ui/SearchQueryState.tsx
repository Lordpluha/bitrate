import type { SafeUser } from '@/entities/User'
import type { WebPlayerSearchResults } from '@/features/Search/api/client'
import { SearchResults } from '@/features/Search/ui/SearchResults'
import { ErrorState } from '@/shared/ui/ErrorState'

type SearchQueryStateProps = {
  data: Pick<
    WebPlayerSearchResults,
    'albums' | 'artists' | 'playlists' | 'tracks'
  >
  hasError: boolean
  isFetching: boolean
  onRetry: () => void
  query: string
  users: SafeUser[]
}

export const SearchQueryState = ({
  data,
  hasError,
  isFetching,
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
    return <div className="text-text-subdued">Searching...</div>
  }

  if (hasError && !hasResults) {
    return (
      <ErrorState
        description="Some search results could not be loaded. Check your connection and try again."
        onRetry={onRetry}
        title="Search is unavailable"
      />
    )
  }

  if (!hasResults) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text">
          No results found for "{query}"
        </h1>
        <p className="mt-2 text-text-subdued">
          Please make sure your words are spelled correctly, or use fewer or
          different keywords.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {hasError ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface px-4 py-3 text-sm text-text"
          role="alert"
        >
          <span>Some result types could not be loaded.</span>
          <button
            className="font-bold underline hover:no-underline"
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
        playlists={playlists}
        query={query}
        tracks={tracks}
        users={users}
      />
    </div>
  )
}
