/** Describes the track playing event. */
export interface TrackPlayingEvent {
  /** The track id value. */
  trackId: string
  /** The current time value. */
  currentTime: number
  /** The bitrate value. */
  bitrate: number
  /** The format value. */
  format: string
  /** The user id value. */
  userId: string
}

/** Describes the track paused event. */
export interface TrackPausedEvent {
  /** The track id value. */
  trackId: string
  /** The current time value. */
  currentTime: number
  /** The user id value. */
  userId: string
}

/** Describes the track updated event. */
export interface TrackUpdatedEvent {
  /** The track id value. */
  trackId: string
  /** The current time value. */
  currentTime: number
  /** The is playing value. */
  isPlaying: boolean
  /** The user id value. */
  userId: string
}

/** Defines the track state event. */
export type TrackStateEvent =
  | {
      trackId?: string
      currentTime?: number
      isPlaying: boolean
    }
  | { error: string }

/** Describes the play track payload. */
export interface PlayTrackPayload {
  /** The track id value. */
  trackId: string
  /** The current time value. */
  currentTime: number
  /** The bitrate value. */
  bitrate?: number
  /** The format value. */
  format?: string
}

/** Describes the pause track payload. */
export interface PauseTrackPayload {
  /** The track id value. */
  trackId: string
  /** The current time value. */
  currentTime: number
}

/** Describes the update streaming payload. */
export interface UpdateStreamingPayload extends PauseTrackPayload {
  /** The is playing value. */
  isPlaying: boolean
}

/** Describes the stream track payload. */
export interface StreamTrackPayload {
  /** The track id value. */
  trackId: string
  /** The bitrate value. */
  bitrate?: number
  /** The format value. */
  format?: string
}

/** Describes the audio chunk event. */
export interface AudioChunkEvent {
  /** The track id value. */
  trackId: string
  /** The sequence value. */
  sequence: number
  /** The chunk value. */
  chunk: Buffer
}

/** Describes the audio socket events. */
export interface AudioSocketEvents {
  // Client to Server events
  /** The play track value. */
  playTrack: (data: PlayTrackPayload) => void
  /** The pause track value. */
  pauseTrack: (data: PauseTrackPayload) => void
  /** The update streaming value. */
  updateStreaming: (data: UpdateStreamingPayload) => void
  /** The get current state value. */
  getCurrentState: () => void
  /** The stream track value. */
  streamTrack: (data: StreamTrackPayload) => void
  /** The stop track stream value. */
  stopTrackStream: () => void

  // Server to Client events
  /** The track playing value. */
  trackPlaying: (data: TrackPlayingEvent) => void
  /** The track paused value. */
  trackPaused: (data: TrackPausedEvent) => void
  /** The track updated value. */
  trackUpdated: (data: TrackUpdatedEvent) => void
  /** The track state value. */
  trackState: (data: TrackStateEvent) => void
  /** The current state value. */
  currentState: (data: TrackStateEvent) => void
  /** The audio stream started value. */
  audioStreamStarted: (data: {
    trackId: string
    bitrate: number
    format: string
    codec: string | null
    contentType: string
    size: number
  }) => void
  /** The audio chunk value. */
  audioChunk: (data: AudioChunkEvent, acknowledge: () => void) => void
  /** The audio stream ended value. */
  audioStreamEnded: (data: { trackId: string; chunks: number }) => void
  /** The audio stream error value. */
  audioStreamError: (data: { trackId: string; error: string }) => void
}
