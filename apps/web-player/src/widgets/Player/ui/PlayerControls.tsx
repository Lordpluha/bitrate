'use client'

import { cn } from '@bitrate/ui-react'
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
    <div className="flex max-w-180.5 flex-1 flex-col items-center gap-2">
      <div className="flex items-center gap-4">
        <button
          aria-label={isShuffled ? 'Disable shuffle' : 'Enable shuffle'}
          className={cn(
            'p-1 hover:scale-110 transition-transform',
            isShuffled ? 'text-primary' : 'text-muted-foreground',
          )}
          disabled={!onShuffleToggle}
          onClick={onShuffleToggle}
          type="button"
        >
          <Shuffle size={17} />
        </button>

        <TrackNavigationButton
          direction="previous"
          onClick={onPrevious}
          track={previousTrack}
        />

        <button
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="flex size-11.5 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
          onClick={onPlayPause}
          type="button"
        >
          {isPlaying ? (
            <Pause fill="currentColor" size={22} />
          ) : (
            <Play className="ml-0.5" fill="currentColor" size={22} />
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
            repeatMode !== 'off' ? 'text-primary' : 'text-muted-foreground',
          )}
          disabled={!onRepeatToggle}
          onClick={onRepeatToggle}
          type="button"
        >
          {repeatMode === 'one' ? <Repeat1 size={17} /> : <Repeat size={17} />}
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
