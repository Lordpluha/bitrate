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
    className={`fixed inset-x-4 bottom-4 z-50 hidden h-22 items-center gap-6 rounded-2xl border border-border bg-card px-5.5 shadow-2xl transition-transform duration-300 ease-in-out xl:flex ${
      isVisible ? 'translate-y-0' : 'translate-y-[calc(100%+16px)]'
    }`}
  >
    <div className="w-80 min-w-0 shrink-0">
      <TrackInfo
        artist={artist}
        coverUrl={coverUrl}
        isLiked={isLiked}
        onLikeToggle={onLikeToggle}
        title={title}
      />
    </div>

    <div className="flex min-w-0 flex-1 justify-center">
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

    <div className="flex shrink-0 justify-end">
      <PlayerActions
        onExpand={onExpand}
        onPictureInPicture={onPictureInPicture}
        onVolumeChange={onVolumeChange}
        volume={volume}
      />
    </div>
  </div>
)
