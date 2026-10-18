export type MediaCardItem = {
  /**
   * Stable entity id. Required because titles are not unique — a user can own
   * several playlists called "My Playlist #1", and keying a list by title makes
   * React drop the duplicates.
   */
  id: string
  description: string
  href?: string
  image: string
  /** What the card's play button starts; cards without it only open their page. */
  playKind?: 'album' | 'playlist' | 'track'
  title: string
}

type SearchResultKind = 'Album' | 'Artist' | 'Playlist' | 'Profile' | 'Song'

export type SearchResultRow = {
  /** When set, the subtitle renders as a link to that artist's page. */
  artistId?: string
  circularImage?: boolean
  href?: string
  image: string
  kind: SearchResultKind
  subtitle: string
  title: string
}
