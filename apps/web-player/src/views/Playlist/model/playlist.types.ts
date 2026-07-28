import type { TrackEntity } from '@/entities/Track'

export type TrackViewMode = 'compact' | 'list'

export type PlaylistPlayback = {
  currentTrackIndex: number
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
  addTrack: (track: TrackEntity) => void
  removeTrack: (trackId: string) => void
}
