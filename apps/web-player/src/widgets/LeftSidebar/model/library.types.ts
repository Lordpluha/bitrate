export type { PlaylistLibraryItem as LibraryMusicItem } from '@/entities/Playlist'

export type PlaylistLibrarySourceItem = {
  cover?: string | null
  id: string
  title: string
  tracks?: unknown[]
  user?: { username?: string }
}
