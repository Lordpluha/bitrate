import type { ApiSchemas } from '@spotify/contracts'

export type TrackDirection = 'next' | 'prev'
export type PlayerTrack = ApiSchemas['TrackEntity']
export type RepeatMode = 'off' | 'all' | 'one'

export type QueuedTrack = {
  queueId: string
  track: PlayerTrack
}

export type PlayPlaylistInput = {
  currentPlaylistId: string | null
  currentPlaylistName: string | null
  startTrack: PlayerTrack
  startTrackIndex?: number
  tracks: PlayerTrack[]
}

export type PlayerState = PlayerSnapshot & {
  addToQueue: (track: PlayerTrack) => void
  advanceOnTrackEnd: () => void
  changeTrack: (direction: TrackDirection) => void
  clearQueue: () => void
  cycleRepeatMode: () => void
  pause: () => void
  play: (track: PlayerTrack) => void
  playNext: (track: PlayerTrack) => void
  playPlaylist: (input: PlayPlaylistInput) => void
  removeFromQueue: (queueId: string) => void
  reset: () => void
  restorePlayerSession: (session: Partial<PlayerSnapshot>) => void
  setCurrentPlaylistName: (name: string | null) => void
  setCurrentTime: (currentTime: number) => void
  setDuration: (duration: number) => void
  setIsPlaying: (isPlaying: boolean) => void
  setPlaylistTracks: (playlist: PlayerTrack[]) => void
  setProgress: (progress: number) => void
  setRepeatMode: (repeatMode: RepeatMode) => void
  setShuffleEnabled: (isShuffled: boolean) => void
  setVolume: (volume: number) => void
  togglePlay: () => void
}

export type PlayerSnapshot = {
  currentPlaylistId: string | null
  currentPlaylistName: string | null
  /** Queue item currently playing; null means the track comes from its playlist context. */
  currentQueueId: string | null
  currentTime: number
  currentTrack: PlayerTrack | null
  currentTrackIndex: number
  duration: number
  isPlaying: boolean
  isShuffled: boolean
  /** Changes for every track transition, including queued copies of the same track. */
  playbackSequence: number
  playlist: PlayerTrack[]
  progress: number
  queue: QueuedTrack[]
  repeatMode: RepeatMode
  volume: number
}
