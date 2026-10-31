import { Button } from '@bitrate/ui-react'
import type { MusicTrack } from '@entities/music'
import { releaseCoverUrl } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { formatDuration } from '@shared/lib/format'
import { Music2, Pause, Play, Volume1, Volume2, VolumeX, X } from 'lucide-react'

interface PreviewBarProps {
  track: MusicTrack
  playing: boolean
  /** Position and length in seconds; length is 0 until the audio reports it. */
  time: number
  duration: number
  /** 0–1, and whether sound is muted. */
  volume: number
  muted: boolean
  onToggle: () => void
  onVolume: (level: number) => void
  onMute: () => void
  onSeek: (seconds: number) => void
  onClose: () => void
}

const clock = (seconds: number) => formatDuration(Math.floor(seconds))

/** The catalogue's mini player: what is playing, play/pause, a seekable timeline and close. */
export function PreviewBar({
  track,
  playing,
  time,
  duration,
  volume,
  muted,
  onToggle,
  onSeek,
  onVolume,
  onMute,
  onClose,
}: PreviewBarProps) {
  const { t } = useI18n()
  const length = duration || track.duration || 0
  const progress = length > 0 ? Math.min(time / length, 1) * 100 : 0
  const level = muted ? 0 : volume
  const VolumeIcon = level === 0 ? VolumeX : level < 0.5 ? Volume1 : Volume2
  return (
    <section
      aria-label={t('music.player.label')}
      className="artist-music-player"
    >
      {track.cover ? (
        <img
          alt=""
          className="artist-music-player-cover"
          src={releaseCoverUrl(track.cover)}
        />
      ) : (
        <span className="artist-music-player-cover artist-music-player-cover-empty">
          <Music2 aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">{track.title}</p>
        <p className="truncate text-xs text-text-secondary">
          {track.artistName}
          {track.isDemo ? ` · ${t('music.sampleAudio')}` : ''}
        </p>
      </div>
      <Button
        aria-label={t(playing ? 'music.table.pause' : 'music.table.play', {
          title: track.title,
        })}
        className="artist-music-player-toggle"
        onClick={onToggle}
        size="icon"
        variant="primary"
      >
        {playing ? (
          <Pause aria-hidden="true" className="size-4" />
        ) : (
          <Play aria-hidden="true" className="size-4" />
        )}
      </Button>
      <div className="artist-music-player-timeline">
        <span className="tabular-nums">{clock(time)}</span>
        <input
          aria-label={t('music.player.seek', { title: track.title })}
          aria-valuetext={`${clock(time)} / ${clock(length)}`}
          disabled={length === 0}
          max={length || 1}
          min={0}
          onChange={(event) => onSeek(Number(event.target.value))}
          step={1}
          style={{
            background: `linear-gradient(to right, var(--color-accent) ${progress}%, color-mix(in srgb, var(--color-foreground) 16%, transparent) ${progress}%)`,
          }}
          type="range"
          value={Math.min(time, length || 1)}
        />
        <span className="tabular-nums">{clock(length)}</span>
      </div>
      <div className="artist-music-player-volume">
        <Button
          aria-label={t(muted ? 'music.player.unmute' : 'music.player.mute')}
          aria-pressed={muted}
          onClick={onMute}
          size="icon"
          variant="ghost"
        >
          <VolumeIcon aria-hidden="true" className="size-4" />
        </Button>
        <input
          aria-label={t('music.player.volume')}
          aria-valuetext={`${Math.round(level * 100)}%`}
          max={1}
          min={0}
          onChange={(event) => onVolume(Number(event.target.value))}
          step={0.05}
          style={{
            background: `linear-gradient(to right, var(--color-foreground) ${level * 100}%, color-mix(in srgb, var(--color-foreground) 16%, transparent) ${level * 100}%)`,
          }}
          type="range"
          value={level}
        />
      </div>
      <Button
        aria-label={t('music.player.close')}
        className="artist-music-player-close"
        onClick={onClose}
        size="icon"
        variant="ghost"
      >
        <X aria-hidden="true" className="size-4" />
      </Button>
    </section>
  )
}
