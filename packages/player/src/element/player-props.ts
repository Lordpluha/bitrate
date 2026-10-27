import type {
  BitratePlayerElement,
  BitratePlayerLabels,
  BitratePlayerRendition,
  BitratePlayerRepeatMode,
  BitratePlayerSource,
  BitratePlayerSourceResolver,
  BitratePlayerStreaming,
  PlayerChrome,
} from '../contract'

/** Props accepted by `<bitrate-player>` — mirrors the `customElement.props` map in `BitratePlayer.svelte`. */
export type BitratePlayerProps = {
  chrome?: PlayerChrome
  renditions?: BitratePlayerRendition[]
  resolveSource?: BitratePlayerSourceResolver | null
  trackTitle?: string
  artist?: string
  coverUrl?: string
  isLiked?: boolean
  isShuffled?: boolean
  repeatMode?: BitratePlayerRepeatMode
  onNext?: (() => void) | null
  onPrevious?: (() => void) | null
  onLikeToggle?: (() => void) | null
  onShuffleToggle?: (() => void) | null
  onRepeatToggle?: (() => void) | null
  onExpand?: (() => void) | null
  onPictureInPicture?: (() => void) | null
  onQueueOpen?: (() => void) | null
  streaming?: BitratePlayerStreaming | null
  source?: BitratePlayerSource | null
  next?: BitratePlayerSource | null
  volume?: number
  muted?: boolean
  mirror?: BitratePlayerElement | null
  labels?: Partial<BitratePlayerLabels> | null
}
