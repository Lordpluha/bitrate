/** The search tabs: everything, or one result type (`types` query param). */
export const SEARCH_FILTERS = ['all', 'tracks', 'artists', 'albums', 'playlists'] as const

export type SearchFilter = (typeof SEARCH_FILTERS)[number]
