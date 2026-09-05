import { ROUTES } from '@/shared/routes'

/** The kinds a library row can be, across both card variants. */
type LibraryHrefTarget = {
  id: string
  type: 'album' | 'artist' | 'playlist' | 'podcast' | 'single'
}

/**
 * Destination for a library row, by kind.
 *
 * Shared by the list and the card so a followed artist cannot end up linking to
 * a playlist route that does not exist.
 */
export const resolveLibraryHref = ({ id, type }: LibraryHrefTarget) => {
  if (id === 'liked-songs') return ROUTES.likedSongs
  if (type === 'artist') return ROUTES.artist(id)
  if (type === 'podcast') return ROUTES.podcast(id)
  return ROUTES.playlist(id)
}
