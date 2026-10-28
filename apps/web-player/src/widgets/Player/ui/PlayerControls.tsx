'use client'

import { cn } from '@bitrate/ui-react'
import { PlayerMirror, usePlayerNavigationTracks } from '@entities/Player'
import type { CSSProperties } from 'react'
import { TrackNavigationButton } from '@/widgets/Player/ui/TrackNavigationButton'

/** The package draws shuffle/repeat at 16px and Play at 18px; the design's sizes scale them. */
const MODE_ICON_PX = 16
const PLAY_ICON_PX = 18

type ControlsSize = 'bar' | 'large'

/** The design's Transport and Seek Bar sizes, as the player element's theme variables. */
const themeFor = (size: ControlsSize): CSSProperties => {
  const isLarge = size === 'large'
  const modeIcon = isLarge ? 22 : 17
  const playIcon = isLarge ? 30 : 22
  return {
    /** The parts' muted colour is the design's muted-foreground, not the darker subdued text. */
    '--color-text-subdued': 'var(--color-muted-foreground)',
    '--bitrate-player-accent': 'var(--color-primary)',
    '--bitrate-player-icon-button-size': `${(modeIcon + 8) / 16}rem`,
    '--bitrate-player-icon-scale': modeIcon / MODE_ICON_PX,
    '--bitrate-player-play-background': 'var(--color-primary)',
    '--bitrate-player-play-foreground': 'var(--color-primary-foreground)',
    '--bitrate-player-play-icon-scale': playIcon / PLAY_ICON_PX,
    '--bitrate-player-play-size': isLarge ? '4.25rem' : '2.875rem',
    '--bitrate-player-thumb-color': 'var(--color-foreground)',
    /** The large Seek Bar shows its thumb at rest; the bar's appears on hover. */
    '--bitrate-player-thumb-opacity': isLarge ? 1 : 0,
    '--bitrate-player-thumb-size': isLarge ? '0.75rem' : '0.625rem',
    '--bitrate-player-time-min-width': '1.75rem',
    '--bitrate-player-time-size': isLarge ? '0.75rem' : '11px',
    '--bitrate-player-track-color': 'var(--color-progress-track)',
    '--bitrate-player-track-height': isLarge ? '0.25rem' : '0.1875rem',
  }
}

interface PlayerControlsProps {
  onNext: () => void
  onPrevious: () => void
  /** `bar`: the desktop player bar. `large`: the design's Transport over a stacked Seek Bar. */
  size?: ControlsSize
}

/**
 * The design's Transport and Seek Bar on the playing element: shuffle, Play and repeat are its
 * parts and so follow its state, while Previous and Next stay web-player buttons for their
 * track preview cards.
 */
export const PlayerControls = ({
  onNext,
  onPrevious,
  size = 'bar',
}: PlayerControlsProps) => {
  const { nextTrack, previousTrack } = usePlayerNavigationTracks()
  const isLarge = size === 'large'
  const skipIconSize = isLarge ? 30 : 22
  const seek = (
    <bitrate-player-seek
      className="w-full"
      variant={isLarge ? 'stacked' : 'full'}
    />
  )

  return (
    <PlayerMirror
      className={cn(
        'flex flex-col items-center',
        isLarge ? 'w-full gap-5' : 'max-w-180.5 flex-1 gap-2',
      )}
      style={themeFor(size)}
    >
      {isLarge ? seek : null}
      <div
        className={cn(
          'flex items-center',
          isLarge ? 'w-full justify-between gap-3' : 'gap-4',
        )}
      >
        <bitrate-player-transport controls="shuffle" />
        <TrackNavigationButton
          direction="previous"
          iconSize={skipIconSize}
          onClick={onPrevious}
          track={previousTrack}
        />
        <bitrate-player-transport controls="play" />
        <TrackNavigationButton
          direction="next"
          iconSize={skipIconSize}
          onClick={onNext}
          track={nextTrack}
        />
        <bitrate-player-transport controls="repeat" />
      </div>
      {isLarge ? null : seek}
    </PlayerMirror>
  )
}
