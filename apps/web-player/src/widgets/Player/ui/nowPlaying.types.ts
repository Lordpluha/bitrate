export type NowPlayingViewProps = {
  artist: string
  coverUrl: string
  currentTime: number
  duration: number
  isLiked?: boolean
  isOpen: boolean
  isPlaying: boolean
  onClose: () => void
  onLikeToggle?: () => void
  onNext: () => void
  onPlayPause: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  playlistTitle?: string
  title: string
  volume: number
}

export type NowPlayingTrackProps = Pick<
  NowPlayingViewProps,
  'artist' | 'coverUrl' | 'isLiked' | 'onLikeToggle' | 'title'
>

export type NowPlayingPlaybackProps = Pick<
  NowPlayingViewProps,
  | 'currentTime'
  | 'duration'
  | 'isPlaying'
  | 'onNext'
  | 'onPlayPause'
  | 'onPrevious'
  | 'onSeek'
>
