'use client'

import { FloatingPlayerWindow } from './FloatingPlayerWindow'
import { NowPlayingView } from './NowPlayingView'

type PlayerResponsiveViewsProps = {
  artist: string
  coverUrl: string
  currentTime: number
  duration: number
  floatingWindow: Window | null
  isExpanded: boolean
  isLiked: boolean
  isPlaying: boolean
  onCloseExpanded: () => void
  onCloseFloating: () => void
  onLikeToggle: () => void
  onNext: () => void
  onPlayPause: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  playlistTitle: string
  title: string
  volume: number
}

export const PlayerResponsiveViews = ({
  artist,
  coverUrl,
  currentTime,
  duration,
  floatingWindow,
  isExpanded,
  isLiked,
  isPlaying,
  onCloseExpanded,
  onCloseFloating,
  onLikeToggle,
  onNext,
  onPlayPause,
  onPrevious,
  onSeek,
  onVolumeChange,
  playlistTitle,
  title,
  volume,
}: PlayerResponsiveViewsProps) => (
  <>
    <FloatingPlayerWindow
      artist={artist}
      coverUrl={coverUrl}
      currentTime={currentTime}
      duration={duration}
      isPlaying={isPlaying}
      onClose={onCloseFloating}
      onNext={onNext}
      onPlayPause={onPlayPause}
      onPrevious={onPrevious}
      onSeek={onSeek}
      targetWindow={floatingWindow}
      title={title}
    />

    <NowPlayingView
      artist={artist}
      coverUrl={coverUrl}
      isLiked={isLiked}
      isOpen={isExpanded}
      onClose={onCloseExpanded}
      onLikeToggle={onLikeToggle}
      onNext={onNext}
      onPrevious={onPrevious}
      onVolumeChange={onVolumeChange}
      playlistTitle={playlistTitle}
      title={title}
      volume={volume}
    />
  </>
)
