'use client'

import { cn } from '@spotify/ui-react'
import { Pause, Play, Repeat, Repeat1, Shuffle } from 'lucide-react'
import { usePlayerNavigationTracks } from '@/widgets/Player/model/usePlayerNavigationTracks'
import { PlaybackProgress } from '@/widgets/Player/ui/PlaybackProgress'
import { TrackNavigationButton } from '@/widgets/Player/ui/TrackNavigationButton'

const repeatLabels: Record<'off' | 'all' | 'one', string> = {
  all: 'Repeat one track',
  off: 'Repeat playlist',
  one: 'Disable repeat',
}

interface PlayerControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  isShuffled?: boolean
  repeatMode?: 'off' | 'all' | 'one'
  onShuffleToggle?: () => void
  onRepeatToggle?: () => void
}

export const PlayerControls = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  isShuffled = false,
  repeatMode = 'off',
  onShuffleToggle,
  onRepeatToggle,
}: PlayerControlsProps) => {
  const { nextTrack, previousTrack } = usePlayerNavigationTracks()

  return (
    <div className="flex-1 flex flex-col items-center gap-2 max-w-180.5">
      <div className="flex items-center gap-4">
        <button
          aria-label={isShuffled ? 'Disable shuffle' : 'Enable shuffle'}
          className={cn(
            'p-1 hover:scale-110 transition-transform',
            isShuffled ? 'text-green-500' : 'text-text-subdued',
          )}
          disabled={!onShuffleToggle}
          onClick={onShuffleToggle}
          type="button"
        >
          <Shuffle size={16} />
        </button>

        <TrackNavigationButton
          direction="previous"
          onClick={onPrevious}
          track={previousTrack}
        />

        <button
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="w-8 h-8 rounded-full bg-text hover:scale-105 transition-transform flex items-center justify-center"
          onClick={onPlayPause}
          type="button"
        >
          {isPlaying ? (
            <Pause className="text-background" fill="currentColor" size={20} />
          ) : (
            <Play
              className="text-background ml-0.5"
              fill="currentColor"
              size={20}
            />
          )}
        </button>

        <TrackNavigationButton
          direction="next"
          onClick={onNext}
          track={nextTrack}
        />

        <button
          aria-label={repeatLabels[repeatMode]}
          className={cn(
            'p-1 hover:scale-110 transition-transform',
            repeatMode !== 'off' ? 'text-green-500' : 'text-text-subdued',
          )}
          disabled={!onRepeatToggle}
          onClick={onRepeatToggle}
          type="button"
        >
          {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
        </button>
      </div>

      <PlaybackProgress
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
      />
    </div>
  )
}
