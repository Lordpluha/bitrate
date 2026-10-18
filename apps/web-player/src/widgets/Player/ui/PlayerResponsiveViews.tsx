'use client'

import type { RepeatMode } from '@entities/Player'
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
  isShuffled: boolean
  onCloseExpanded: () => void
  onCloseFloating: () => void
  onLikeToggle: () => void
  onNext: () => void
  onPlayPause: () => void
  onPrevious: () => void
  onRepeatToggle: () => void
  onSeek: (time: number) => void
  onShuffleToggle: () => void
  onVolumeChange: (volume: number) => void
  playlistTitle: string
  repeatMode: RepeatMode
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
  isShuffled,
  onCloseExpanded,
  onCloseFloating,
  onLikeToggle,
  onNext,
  onPlayPause,
  onPrevious,
  onRepeatToggle,
  onSeek,
  onShuffleToggle,
  onVolumeChange,
  playlistTitle,
  repeatMode,
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
      isShuffled={isShuffled}
      onClose={onCloseExpanded}
      onLikeToggle={onLikeToggle}
      onNext={onNext}
      onPlayPause={onPlayPause}
      onPrevious={onPrevious}
      onRepeatToggle={onRepeatToggle}
      onSeek={onSeek}
      onShuffleToggle={onShuffleToggle}
      onVolumeChange={onVolumeChange}
      playlistTitle={playlistTitle}
      repeatMode={repeatMode}
      title={title}
      volume={volume}
    />
  </>
)
