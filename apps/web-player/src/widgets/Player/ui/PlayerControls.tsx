'use client'

import { cn } from '@bitrate/ui-react'
import { Pause, Play, Repeat, Repeat1, Shuffle } from 'lucide-react'
import { type TranslationKey, useI18n } from '@/shared/i18n'
import { usePlayerNavigationTracks } from '@/widgets/Player/model/usePlayerNavigationTracks'
import { PlaybackProgress } from '@/widgets/Player/ui/PlaybackProgress'
import { TrackNavigationButton } from '@/widgets/Player/ui/TrackNavigationButton'

const repeatLabels: Record<'off' | 'all' | 'one', TranslationKey> = {
  all: 'player.repeatOne',
  off: 'player.repeatPlaylist',
  one: 'player.disableRepeat',
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
  /** `bar`: the desktop player bar. `large`: the design's Transport over a stacked Seek Bar. */
  size?: 'bar' | 'large'
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
  size = 'bar',
}: PlayerControlsProps) => {
  const { t } = useI18n()
  const { nextTrack, previousTrack } = usePlayerNavigationTracks()
  const isLarge = size === 'large'
  const modeIconSize = isLarge ? 22 : 17
  const skipIconSize = isLarge ? 30 : 22
  const progress = (
    <PlaybackProgress
      currentTime={currentTime}
      duration={duration}
      layout={isLarge ? 'stacked' : 'inline'}
      onSeek={onSeek}
    />
  )

  return (
    <div
      className={cn(
        'flex flex-col items-center',
        isLarge ? 'w-full gap-5' : 'max-w-180.5 flex-1 gap-2',
      )}
    >
      {isLarge ? progress : null}
      <div
        className={cn(
          'flex items-center',
          isLarge ? 'w-full justify-between gap-3' : 'gap-4',
        )}
      >
        <button
          aria-label={
            isShuffled
              ? t('playlist.disableShuffle')
              : t('player.enableShuffle')
          }
          className={cn(
            'p-1 hover:scale-110 transition-transform',
            isShuffled ? 'text-primary' : 'text-muted-foreground',
          )}
          disabled={!onShuffleToggle}
          onClick={onShuffleToggle}
          type="button"
        >
          <Shuffle size={modeIconSize} />
        </button>

        <TrackNavigationButton
          direction="previous"
          iconSize={skipIconSize}
          onClick={onPrevious}
          track={previousTrack}
        />

        <button
          aria-label={isPlaying ? t('trackMenu.pause') : t('trackMenu.play')}
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105',
            isLarge ? 'size-17' : 'size-11.5',
          )}
          onClick={onPlayPause}
          type="button"
        >
          {isPlaying ? (
            <Pause fill="currentColor" size={skipIconSize} />
          ) : (
            <Play className="ml-0.5" fill="currentColor" size={skipIconSize} />
          )}
        </button>

        <TrackNavigationButton
          direction="next"
          iconSize={skipIconSize}
          onClick={onNext}
          track={nextTrack}
        />

        <button
          aria-label={t(repeatLabels[repeatMode])}
          className={cn(
            'p-1 hover:scale-110 transition-transform',
            repeatMode !== 'off' ? 'text-primary' : 'text-muted-foreground',
          )}
          disabled={!onRepeatToggle}
          onClick={onRepeatToggle}
          type="button"
        >
          {repeatMode === 'one' ? (
            <Repeat1 size={modeIconSize} />
          ) : (
            <Repeat size={modeIconSize} />
          )}
        </button>
      </div>

      {isLarge ? null : progress}
    </div>
  )
}
