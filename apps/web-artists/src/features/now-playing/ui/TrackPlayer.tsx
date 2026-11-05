import { Button, cn } from '@bitrate/ui-react'
import { playableAudioUrl, releaseAudioUrl } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { formatDuration } from '@shared/lib/format'
import { LoaderCircle, Pause, Play } from 'lucide-react'
import {
  useIsPlaying,
  useNowPlaying,
  usePlaybackTime,
} from '../model/nowPlaying'
import { Waveform } from './Waveform'

interface TrackPlayerProps {
  releaseId: string
  trackId: string
  title: string
  coverUrl?: string | null
  /** Normalised peaks of the master; empty draws a flat line. */
  waveform?: readonly number[]
  /** Seconds, when the master has been measured. */
  duration?: number | null
  className?: string
}

const clock = (seconds: number) => formatDuration(Math.floor(seconds))

/**
 * An owned master as a row control: play/pause, its waveform as the timeline and the time.
 * Playback itself happens in the workspace player, so it continues across pages.
 */
export function TrackPlayer({
  releaseId,
  trackId,
  title,
  coverUrl,
  waveform = [],
  duration,
  className,
}: TrackPlayerProps) {
  const { t } = useI18n()
  const key = `${releaseId}:${trackId}`
  const { toggle, seek, status } = useNowPlaying()
  const { isCurrent, playing } = useIsPlaying(key)
  const time = usePlaybackTime()
  const length =
    isCurrent && time.duration > 0 ? time.duration : (duration ?? 0)
  const position = isCurrent ? time.currentTime : 0
  const loading = isCurrent && status === 'loading'
  const Icon = loading ? LoaderCircle : playing ? Pause : Play
  return (
    <div
      className={cn('artist-track-player', className)}
      data-current={isCurrent}
    >
      <Button
        aria-label={t(playing ? 'music.table.pause' : 'music.table.play', {
          title,
        })}
        className="artist-track-player-toggle"
        onClick={() =>
          toggle({
            key,
            title,
            coverUrl,
            waveform,
            releaseId,
            resolve: () =>
              playableAudioUrl(releaseAudioUrl(releaseId, trackId)),
          })
        }
        size="icon"
        variant="primary"
      >
        <Icon
          aria-hidden="true"
          className={cn('size-4', loading && 'animate-spin')}
        />
      </Button>
      <Waveform
        bars={120}
        className="artist-track-player-wave"
        currentTime={position}
        duration={length}
        label={t('music.player.seek', { title })}
        onSeek={isCurrent ? seek : undefined}
        peaks={waveform}
        progress={length > 0 ? Math.min(1, position / length) : 0}
      />
      <span className="artist-track-player-time">
        {clock(position)} / {clock(length)}
      </span>
    </div>
  )
}
