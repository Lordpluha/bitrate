import type { PlaylistLibraryItem } from '@/entities/Playlist'
import type { TrackEntity } from '@/entities/Track'

/** Listening history lives on the Recents page, not in the library. */
export type LibrarySection = 'playlists' | 'liked' | 'albums'

export type SortMode = 'recent' | 'title'

export type LibraryViewMode = 'grid' | 'list'

export type LibraryControls = {
  activeSection: LibrarySection
  query: string
  sortMode: SortMode
  viewMode: LibraryViewMode
}

export type LibraryPlaylist = PlaylistLibraryItem

export type LibraryAlbum = {
  id: string
  title: string
  cover?: string | null
  releaseDate?: string | null
  createdAt?: string | null
}

export type LibraryData = {
  albums: LibraryAlbum[]
  isPending: boolean
  playlists: LibraryPlaylist[]
  tracks: TrackEntity[]
}
