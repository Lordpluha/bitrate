export interface TrackPlayingEvent {
  trackId: string
  currentTime: number
  bitrate: number
  format: string
  userId: string
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

export type TrackStateEvent =
  | {
      trackId?: string
      currentTime?: number
      isPlaying: boolean
    }
  | { error: string }

export interface PlayTrackPayload {
  trackId: string
  currentTime: number
  bitrate?: number
  format?: string
}

export interface PauseTrackPayload {
  trackId: string
  currentTime: number
}

export interface UpdateStreamingPayload extends PauseTrackPayload {
  isPlaying: boolean
}

export interface StreamTrackPayload {
  trackId: string
  bitrate?: number
  format?: string
}

export interface AudioChunkEvent {
  trackId: string
  sequence: number
  chunk: Buffer
}

export interface AudioSocketEvents {
  // Client to Server events
  playTrack: (data: PlayTrackPayload) => void
  pauseTrack: (data: PauseTrackPayload) => void
  updateStreaming: (data: UpdateStreamingPayload) => void
  getCurrentState: () => void
  streamTrack: (data: StreamTrackPayload) => void
  stopTrackStream: () => void

  // Server to Client events
  trackPlaying: (data: TrackPlayingEvent) => void
  trackPaused: (data: TrackPausedEvent) => void
  trackUpdated: (data: TrackUpdatedEvent) => void
  trackState: (data: TrackStateEvent) => void
  currentState: (data: TrackStateEvent) => void
  audioStreamStarted: (data: {
    trackId: string
    bitrate: number
    format: string
    codec: string | null
    contentType: string
    size: number
  }) => void
  audioChunk: (data: AudioChunkEvent, acknowledge: () => void) => void
  audioStreamEnded: (data: { trackId: string; chunks: number }) => void
  audioStreamError: (data: { trackId: string; error: string }) => void
}
