export type LibraryMusicItem = {
  cover: string
  id: string
  title: string
  tracksCount?: number
  type: 'playlist' | 'album' | 'single' | 'podcast'
  username: string
}

export type PlaylistLibrarySourceItem = {
  cover?: string | null
  id: string
  title: string
  tracks?: unknown[]
  user?: { username?: string }
}
