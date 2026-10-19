import type { RepeatMode } from '@entities/Player'

export type NowPlayingViewProps = {
  artist: string
  coverUrl: string
  currentTime: number
  duration: number
  isLiked?: boolean
  isOpen: boolean
  isPlaying: boolean
  isShuffled: boolean
  onClose: () => void
  onLikeToggle?: () => void
  onNext: () => void
  onPlayPause: () => void
  onPrevious: () => void
  onRepeatToggle: () => void
  onSeek: (time: number) => void
  onShuffleToggle: () => void
  onVolumeChange: (volume: number) => void
  playlistTitle?: string
  repeatMode: RepeatMode
  title: string
  volume: number
}
