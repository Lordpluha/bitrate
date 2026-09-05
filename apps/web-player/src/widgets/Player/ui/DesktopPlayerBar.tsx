'use client'

import type { RepeatMode } from '@entities/Player'
import { PlayerActions } from './PlayerActions'
import { PlayerControls } from './PlayerControls'
import { TrackInfo } from './TrackInfo'

type DesktopPlayerBarProps = {
  artist: string
  coverUrl: string
  currentTime: number
  duration: number
  isLiked: boolean
  isPlaying: boolean
  isShuffled: boolean
  isVisible: boolean
  onExpand: () => void
  onLikeToggle: () => void
  onNext: () => void
  onPictureInPicture: () => void
  onPlayPause: () => void
  onPrevious: () => void
  onRepeatToggle: () => void
  onSeek: (time: number) => void
  onShuffleToggle: () => void
  onVolumeChange: (volume: number) => void
  repeatMode: RepeatMode
  title: string
  volume: number
}

export const DesktopPlayerBar = ({
  artist,
  coverUrl,
  currentTime,
  duration,
  isLiked,
  isPlaying,
  isShuffled,
  isVisible,
  onExpand,
  onLikeToggle,
  onNext,
  onPictureInPicture,
  onPlayPause,
  onPrevious,
  onRepeatToggle,
  onSeek,
  onShuffleToggle,
  onVolumeChange,
  repeatMode,
  title,
  volume,
}: DesktopPlayerBarProps) => (
  <div
    className={`fixed bottom-0 left-0 right-0 h-22.5 bg-background border-t border-border px-4 hidden xl:flex items-center justify-between gap-4 z-50 transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}
  >
    <div className="w-[25%]">
      <TrackInfo
        artist={artist}
        coverUrl={coverUrl}
        isLiked={isLiked}
        onLikeToggle={onLikeToggle}
        onPictureInPicture={onPictureInPicture}
        title={title}
      />
    </div>

    <div className="w-[40%] flex justify-center">
      <PlayerControls
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        isShuffled={isShuffled}
        onNext={onNext}
        onPlayPause={onPlayPause}
        onPrevious={onPrevious}
        onRepeatToggle={onRepeatToggle}
        onSeek={onSeek}
        onShuffleToggle={onShuffleToggle}
        repeatMode={repeatMode}
      />
    </div>

    <div className="w-[35%] flex justify-end">
      <PlayerActions
        onExpand={onExpand}
        onVolumeChange={onVolumeChange}
        volume={volume}
      />
    </div>
  </div>
)
