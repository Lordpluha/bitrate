/** Kinds of entries the library sidebar can list. */
export type LibraryItemType = 'artist' | 'playlist' | 'podcast'

/**
 * One row in the library sidebar, normalised across the entity it came from so
 * the list and the filter chips do not care about the source shape.
 */
export type LibraryMusicItem = {
  cover: string
  createdAt?: string
  id: string
  title: string
  tracksCount: number
  type: LibraryItemType
  username: string
}

export type PlaylistLibrarySourceItem = {
  cover?: string | null
  id: string
  title: string
  tracks?: unknown[]
  user?: { username?: string }
}
