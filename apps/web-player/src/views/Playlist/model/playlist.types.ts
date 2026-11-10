import type { TrackEntity } from '@/entities/Track'

export type TrackViewMode = 'compact' | 'list'

export type PlaylistPlayback = {
  currentTrackId?: string
  handleAddToQueue: () => void
  handlePlayPlaylist: () => void
  handleShufflePlaylist: () => void
  isActive: boolean
  isPlaying: boolean
  isShuffled: boolean
  playTrack: (track: TrackEntity, index: number) => void
}

export type PlaylistActions = {
  addingTrackId: string | null
  deletePlaylist: () => void
  existingTrackIds: Set<string>
  /** Adding needs only the id, so a search result can be added without the full track. */
  addTrack: (track: Pick<TrackEntity, 'id'>) => void
  removeTrack: (trackId: string) => void
}
