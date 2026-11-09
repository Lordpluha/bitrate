'use client'

import { cn } from '@bitrate/ui-react'
import { useArtist } from '@entities/Artist'
import { selectMusicPlayer, usePlayerStore } from '@entities/Player'
import { useTrackLike } from '@entities/Track'
import { useI18n } from '@shared/i18n'
import { formatDuration } from '@shared/utils/apiHelpers'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import {
  type PlayerAction,
  PlayerActions,
  TrackInfo,
  TrackNavigationButton,
} from '@widgets/Player'
import { Pause, Play } from 'lucide-react'

/** What the compact bar leaves out: the bar stays about playing, not managing. */
const COMPACT_HIDDEN: readonly PlayerAction[] = ['queue', 'floating']

type DemoPlayerBarProps = {
  className?: string
  /**
   * For a narrow window: a narrower track column, tighter gaps, no time labels, and no queue
   * or floating mini player among the actions, so the controls keep their room.
   */
  compact?: boolean
}

/**
 * The player bar's real parts — Player Track with its like, the track preview buttons and
 * Player Actions — over the player store. The bar's Play and Seek Bar belong to the playing
 * `<bitrate-player>` element, which the landing never mounts (it would stream audio), so the
 * centre is a Play toggle on the same store and the paused position.
 */
export const DemoPlayerBar = ({
  className,
  compact = false,
}: DemoPlayerBarProps) => {
  const { t } = useI18n()
  const {
    changeTrack,
    currentTime,
    currentTrack,
    currentTrackIndex,
    duration,
    isPlaying,
    playlist,
    setVolume,
    togglePlay,
    volume,
  } = usePlayerStore(selectMusicPlayer)
  const { isLiked, toggleLike } = useTrackLike(currentTrack?.id)
  const { data: artist } = useArtist(currentTrack?.artistId)

  if (!currentTrack) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className={cn(
        'flex h-22 items-center gap-6 rounded-2xl border border-border bg-card px-5.5 shadow-2xl',
        compact && 'gap-4 px-4',
        className,
      )}
    >
      <div className={cn('w-64 min-w-0 shrink-0', compact && 'w-52')}>
        <TrackInfo
          artist={artist?.username ?? ''}
          coverUrl={getTrackCoverUrl(currentTrack.cover)}
          isLiked={isLiked}
          onLikeToggle={toggleLike}
          title={currentTrack.title}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <TrackNavigationButton
            direction="previous"
            onClick={() => changeTrack('prev')}
            track={playlist[currentTrackIndex - 1] ?? null}
          />
          <button
            aria-label={
              isPlaying
                ? t('common.pauseName', { name: currentTrack.title })
                : t('common.playName', { name: currentTrack.title })
            }
            className="flex size-11.5 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
            onClick={togglePlay}
            type="button"
          >
            {isPlaying ? (
              <Pause aria-hidden="true" fill="currentColor" size={20} />
            ) : (
              <Play
                aria-hidden="true"
                className="ml-0.5"
                fill="currentColor"
                size={20}
              />
            )}
          </button>
          <TrackNavigationButton
            direction="next"
            onClick={() => changeTrack('next')}
            track={playlist[currentTrackIndex + 1] ?? null}
          />
        </div>
        <div className="flex w-full max-w-120 items-center gap-2 text-[11px] text-muted-foreground tabular-nums">
          <span className={cn('min-w-7 text-right', compact && 'hidden')}>
            {formatDuration(currentTime)}
          </span>
          <span className="relative h-0.75 flex-1 rounded-full bg-progress-track">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </span>
          <span className={cn('min-w-7', compact && 'hidden')}>
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 justify-end">
        <PlayerActions
          hide={compact ? COMPACT_HIDDEN : undefined}
          onVolumeChange={setVolume}
          volume={volume}
        />
      </div>
    </div>
  )
}
