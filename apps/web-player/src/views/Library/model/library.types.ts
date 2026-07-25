import type { ListeningHistoryEntry } from '@/entities/History'
import type { TrackEntity } from '@/entities/Track'

export type LibrarySection = 'playlists' | 'liked' | 'albums' | 'history'

export type SortMode = 'recent' | 'title'

export type LibraryPlaylist = {
  id: string
  title: string
  cover?: string | null
  description?: string | null
  createdAt?: string | null
  tracks?: unknown[]
}

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
