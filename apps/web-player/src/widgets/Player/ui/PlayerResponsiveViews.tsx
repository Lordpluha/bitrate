'use client'

import { FloatingPlayerWindow } from './FloatingPlayerWindow'
import { MiniPlayer } from './MiniPlayer'
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
  onExpand: () => void
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
  onExpand,
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
      currentTime={currentTime}
      duration={duration}
      isLiked={isLiked}
      isOpen={isExpanded}
      isPlaying={isPlaying}
      onClose={onCloseExpanded}
      onLikeToggle={onLikeToggle}
      onNext={onNext}
      onPlayPause={onPlayPause}
      onPrevious={onPrevious}
      onSeek={onSeek}
      onVolumeChange={onVolumeChange}
      playlistTitle={playlistTitle}
      title={title}
      volume={volume}
    />

    <MiniPlayer
      artist={artist}
      coverUrl={coverUrl}
      currentTime={currentTime}
      duration={duration}
      isLiked={isLiked}
      isPlaying={isPlaying}
      isVisible={!isExpanded}
      onExpand={onExpand}
      onLikeToggle={onLikeToggle}
      onNext={onNext}
      onPlayPause={onPlayPause}
      onPrevious={onPrevious}
      title={title}
    />
  </>
)
