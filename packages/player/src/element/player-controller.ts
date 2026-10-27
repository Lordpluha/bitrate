import type {
  BitratePlayerErrorDetail,
  BitratePlayerRendition,
  BitratePlayerRepeatMode,
} from '../contract'

/** The optional host callbacks a control needs before it renders. */
type PlayerCallbacks = {
  onNext: (() => void) | null
  onPrevious: (() => void) | null
  onLikeToggle: (() => void) | null
  onShuffleToggle: (() => void) | null
  onRepeatToggle: (() => void) | null
  onExpand: (() => void) | null
  onPictureInPicture: (() => void) | null
  onQueueOpen: (() => void) | null
}

/**
 * What one `<bitrate-player>` shares with the layouts and part elements that render it. Every
 * field is a getter over the root's reactive state, so reading one inside a Svelte template or
 * `$derived` re-renders when it changes — the object itself must never be wrapped in `$state`
 * (a deep proxy would read each getter once and freeze it).
 */
export type PlayerController = {
  readonly trackTitle: string
  readonly artist: string
  readonly coverUrl: string
  readonly isLiked: boolean
  readonly isShuffled: boolean
  readonly repeatMode: BitratePlayerRepeatMode
  readonly renditions: BitratePlayerRendition[]
  readonly callbacks: PlayerCallbacks
  readonly playing: boolean
  readonly preparing: boolean
  /** False while preparing or with no rendition to resolve — the Play button is disabled. */
  readonly canPlay: boolean
  readonly currentTime: number
  /** The media duration, or 0 while it is unknown. */
  readonly duration: number
  /** Elapsed share of the track, 0–100. */
  readonly seekProgress: number
  readonly volume: number
  /** Volume as 0–100. */
  readonly volumeProgress: number
  readonly muted: boolean
  readonly effectiveBitrate: number | null
  /** More than one rendition to choose between. */
  readonly showQuality: boolean
  readonly error: BitratePlayerErrorDetail | null
  playPause: () => void
  seek: (event: Event) => void
  setVolume: (event: Event) => void
  toggleMute: () => void
  changeQuality: (event: Event) => void
}
