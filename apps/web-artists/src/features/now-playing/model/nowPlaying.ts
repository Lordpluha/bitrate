import { createContext, useContext } from 'react'

/** One playable recording, described by whoever starts it. */
export interface NowPlayingTrack {
  /** Unique per recording; starting the same key again toggles it. */
  key: string
  title: string
  subtitle?: string
  coverUrl?: string | null
  /** Normalised peaks (0–1); empty draws a flat line. */
  waveform?: readonly number[]
  /** The release this recording belongs to, when it has one. */
  releaseId?: string
  /** Resolves the URL to play; a rejection's message is a catalog key. */
  resolve: () => Promise<string>
}

export type NowPlayingStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'error'

export interface NowPlayingControls {
  current: NowPlayingTrack | null
  status: NowPlayingStatus
  /** Translated text of the last playback failure. */
  error: string | null
  volume: number
  muted: boolean
  /** Starts a recording, or pauses/resumes it when it is the current one. */
  toggle: (track: NowPlayingTrack) => void
  seek: (seconds: number) => void
  setVolume: (level: number) => void
  toggleMute: () => void
  /** Stops playback and hides the player. */
  close: () => void
}

/** Position and length in seconds; split out because it changes several times a second. */
export interface PlaybackTime {
  currentTime: number
  duration: number
}

export const NowPlayingContext = createContext<NowPlayingControls | null>(null)
export const PlaybackTimeContext = createContext<PlaybackTime>({
  currentTime: 0,
  duration: 0,
})

export function useNowPlaying() {
  const context = useContext(NowPlayingContext)
  if (!context) throw new Error('NowPlayingProvider is required')
  return context
}

export const usePlaybackTime = () => useContext(PlaybackTimeContext)

/** Whether `key` is the recording the player holds, and whether it is audible. */
export function useIsPlaying(key: string) {
  const { current, status } = useNowPlaying()
  const isCurrent = current?.key === key
  return { isCurrent, playing: isCurrent && status === 'playing' }
}
