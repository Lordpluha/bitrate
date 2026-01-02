export interface TrackPlayingEvent {
  trackId: string
  currentTime: number
  userId: string
  track?: {
    id: string
    title: string
    audioUrl: string
    cover: string | null
  }
}

export interface TrackPausedEvent {
  trackId: string
  currentTime: number
  userId: string
}

export interface TrackUpdatedEvent {
  trackId: string
  currentTime: number
  isPlaying: boolean
  userId: string
}

export interface TrackStateEvent {
  trackId?: string
  currentTime?: number
  isPlaying: boolean
  error?: string
}

export interface AudioSocketEvents {
  // Client to Server events
  playTrack: (data: { trackId: string; userId: string; currentTime: number }) => void
  pauseTrack: (data: { trackId: string; userId: string; currentTime: number }) => void
  updateStreaming: (data: {
    trackId: string
    userId: string
    currentTime: number
    isPlaying: boolean
  }) => void
  getCurrentState: () => void

  // Server to Client events
  trackPlaying: (data: TrackPlayingEvent) => void
  trackPaused: (data: TrackPausedEvent) => void
  trackUpdated: (data: TrackUpdatedEvent) => void
  trackState: (data: TrackStateEvent) => void
  currentState: (data: TrackStateEvent) => void
}
