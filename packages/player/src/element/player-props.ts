import type {
  BitratePlayerRendition,
  BitratePlayerRepeatMode,
  BitratePlayerSourceResolver,
} from '../contract'

/** Props accepted by `<bitrate-player>` — mirrors the `customElement.props` map in `BitratePlayer.svelte`. */
export type BitratePlayerProps = {
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
}
