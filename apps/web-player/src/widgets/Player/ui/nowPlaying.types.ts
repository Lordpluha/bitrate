/** Playback state and transport come from the playing element the view mirrors. */
export type NowPlayingViewProps = {
  artist: string
  coverUrl: string
  isLiked?: boolean
  isOpen: boolean
  onClose: () => void
  onLikeToggle?: () => void
  onNext: () => void
  onPrevious: () => void
  onVolumeChange: (volume: number) => void
  playlistTitle?: string
  title: string
  volume: number
}
