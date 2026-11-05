import { Button, cn } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { formatDuration } from '@shared/lib/format'
import { Link } from '@tanstack/react-router'
import {
  LoaderCircle,
  Music2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useId, useState } from 'react'
import { useNowPlaying, usePlaybackTime } from '../model/nowPlaying'
import { Waveform } from './Waveform'

const clock = (seconds: number) => formatDuration(Math.floor(seconds))

/**
 * What plays now, floating at the bottom of every workspace page. A compact pill opens on
 * hover, or stays open from its toggle, to show the waveform, time, volume and a link back.
 */
export function NowPlayingIsland() {
  const { t } = useI18n()
  const player = useNowPlaying()
  const { currentTime, duration } = usePlaybackTime()
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const moreId = useId()
  const { current, status } = player
  if (!current) return null
  const expanded = pinned || hovered
  const playing = status === 'playing'
  const Icon = status === 'loading' ? LoaderCircle : playing ? Pause : Play
  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0
  return (
    <section
      aria-label={t('music.player.label')}
      className="artist-now-playing"
      data-expanded={expanded}
      data-status={status}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true)
      }}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="artist-now-playing-row">
        {/* The summary opens the details, for touch and keyboard where there is no hover. */}
        <button
          aria-controls={moreId}
          aria-expanded={expanded}
          className="artist-now-playing-summary"
          onClick={() => setPinned(!expanded)}
          type="button"
        >
          <span className="artist-now-playing-cover" data-spinning={playing}>
            {current.coverUrl ? (
              <img alt="" src={current.coverUrl} />
            ) : (
              <Music2 aria-hidden="true" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="artist-now-playing-title">{current.title}</span>
            <span className="artist-now-playing-subtitle">
              {player.error ??
                (current.subtitle ||
                  `${clock(currentTime)} / ${clock(duration)}`)}
            </span>
          </span>
        </button>
        {player.error && (
          <p className="sr-only" role="alert">
            {player.error}
          </p>
        )}
        <span
          aria-hidden="true"
          className="artist-now-playing-eq"
          data-active={playing}
        >
          <i />
          <i />
          <i />
          <i />
        </span>
        <Button
          aria-label={t(playing ? 'music.table.pause' : 'music.table.play', {
            title: current.title,
          })}
          className="artist-now-playing-toggle"
          onClick={() => player.toggle(current)}
          size="icon"
          variant="primary"
        >
          <Icon
            aria-hidden="true"
            className={cn('size-4', status === 'loading' && 'animate-spin')}
          />
        </Button>
        <Button
          aria-label={t('music.player.close')}
          onClick={() => {
            setPinned(false)
            player.close()
          }}
          size="icon"
          variant="ghost"
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>
      <div className="artist-now-playing-more" id={moreId} inert={!expanded}>
        <div className="artist-now-playing-more-inner">
          <Waveform
            bars={150}
            currentTime={currentTime}
            duration={duration}
            label={t('music.player.seek', { title: current.title })}
            onSeek={player.seek}
            peaks={current.waveform ?? []}
            progress={progress}
          />
          <div className="artist-now-playing-meta">
            <span className="tabular-nums">
              {clock(currentTime)} / {clock(duration)}
            </span>
            {current.releaseId && (
              <Link
                className="artist-dash-link"
                params={{ releaseId: current.releaseId }}
                to="/dashboard/music/$releaseId"
              >
                {t('player.openRelease')}
              </Link>
            )}
            <span className="artist-now-playing-volume">
              <button
                aria-label={t(
                  player.muted ? 'music.player.unmute' : 'music.player.mute',
                )}
                onClick={player.toggleMute}
                type="button"
              >
                {player.muted ? (
                  <VolumeX aria-hidden="true" className="size-4" />
                ) : (
                  <Volume2 aria-hidden="true" className="size-4" />
                )}
              </button>
              <input
                aria-label={t('music.player.volume')}
                max={1}
                min={0}
                onChange={(event) =>
                  player.setVolume(Number(event.target.value))
                }
                step={0.05}
                type="range"
                value={player.muted ? 0 : player.volume}
              />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
