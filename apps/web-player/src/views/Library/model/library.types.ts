import type { ListeningHistoryEntry } from '@/entities/History'
import type { PlaylistLibraryItem } from '@/entities/Playlist'
import type { TrackEntity } from '@/entities/Track'

export type LibrarySection = 'playlists' | 'liked' | 'albums' | 'history'

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
  history: ListeningHistoryEntry[]
  isPending: boolean
  playlists: LibraryPlaylist[]
  tracks: TrackEntity[]
}
