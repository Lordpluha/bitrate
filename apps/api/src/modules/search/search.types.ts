/** The result buckets a search can return. */
export type SearchType = 'tracks' | 'artists' | 'albums' | 'playlists'

/** Optional narrowing applied on top of the free-text query. */
export type SearchFilters = {
  year?: number
  genre?: string
  artist?: string
}

/** Everything one search request carries. */
export type SearchOptions = SearchFilters & {
  types: SearchType[]
  page: number
  limit: number
  userId?: string
}

/** One row of the unified result set, whatever bucket it came from. */
export type SearchResult = {
  id: string
  title: string
  subtitle: string | null
  image: string | null
  type: SearchType
  rank: number
  artistId: string | null
  ownerId: string | null
}

/** The shape a `COUNT(*)` query returns. */
export type SearchCount = { count: number }

/** Every bucket, used when the caller does not narrow the search. */
export const ALL_SEARCH_TYPES: SearchType[] = ['tracks', 'artists', 'albums', 'playlists']
