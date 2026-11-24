/** What the engine needs to load one track. */
type EngineTrack = {
  id: string
  url: string
  title: string
  artist: string
  artworkUrl: string | null
  durationSec: number
}

export type EngineState = 'loading' | 'buffering' | 'playing' | 'paused' | 'ended' | 'error'

/** Commands from outside the app UI: lock screen, notification, headset buttons. */
export type RemoteCommand = { type: 'play' | 'pause' | 'next' | 'previous' } | { type: 'seek'; positionSec: number }

export type EngineEvents = {
  onStateChange: (state: EngineState) => void
  onRemoteCommand: (command: RemoteCommand) => void
}

/**
 * The platform audio backend. The store owns the queue; the engine plays one track at a time.
 * Native uses react-native-track-player (`index.ts`), web an `HTMLAudioElement` (`index.web.ts`).
 */
export type AudioEngine = {
  setup: (events: EngineEvents) => Promise<void>
  load: (track: EngineTrack) => Promise<void>
  play: () => Promise<void>
  pause: () => Promise<void>
  seekTo: (positionSec: number) => Promise<void>
  stop: () => Promise<void>
  getPosition: () => Promise<number>
}
