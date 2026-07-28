import type { SafeUser } from '@/entities/User'
import type { WebPlayerSearchResults } from '@/features/Search/api/client'
import { SearchResults } from '@/features/Search/ui/SearchResults'

type SearchQueryStateProps = {
  data: WebPlayerSearchResults
  isFetching: boolean
  query: string
  users: SafeUser[]
}

export const SearchQueryState = ({
  data,
  isFetching,
  query,
  users,
}: SearchQueryStateProps) => {
  const albums = data.albums ?? []
  const playlists = data.playlists ?? []
  const tracks = data.tracks ?? []
  const hasResults =
    tracks.length > 0 ||
    albums.length > 0 ||
    playlists.length > 0 ||
    users.length > 0

  if (isFetching) {
    return <div className="text-text-subdued">Searching...</div>
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
    <SearchResults
      albums={albums}
      playlists={playlists}
      query={query}
      tracks={tracks}
      users={users}
    />
  )
}
