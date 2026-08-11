export type BrowseCategory = {
  color: string
  image: string
  title: string
}

export type MediaCardItem = {
  description: string
  href?: string
  image: string
  title: string
}

export type SearchResultKind =
  | 'Album'
  | 'Artist'
  | 'Playlist'
  | 'Profile'
  | 'Song'

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
