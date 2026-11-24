import type { SearchFilter } from './search-filter'

/** Every catalog query key in one place, so invalidation never guesses a shape. */
export const catalogKeys = {
  feed: ['catalog', 'feed'] as const,
  history: ['catalog', 'history'] as const,
  myPlaylists: ['catalog', 'my-playlists'] as const,
  likedTracks: ['catalog', 'liked-tracks'] as const,
  search: (query: string, filter: SearchFilter) => ['catalog', 'search', query, filter] as const,
  collection: (kind: 'album' | 'playlist', id: string) => ['catalog', 'collection', kind, id] as const,
}
