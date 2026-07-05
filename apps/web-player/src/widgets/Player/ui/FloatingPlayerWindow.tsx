'use client'

import { Pause, Play, SkipBack, SkipForward, X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface FloatingPlayerWindowProps {
  targetWindow: Window | null
  title: string
  artist: string
  coverUrl: string
  isPlaying: boolean
  currentTime: number
  duration: number
  onPlayPause: () => void
  onPrevious: () => void
  onNext: () => void
  onSeek: (time: number) => void
  onClose: () => void
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const FloatingPlayerWindow = ({
  targetWindow,
  title,
  artist,
  coverUrl,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  onClose,
}: FloatingPlayerWindowProps) => {
  if (!targetWindow || targetWindow.closed) return null

  const progress =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0
  const safeCurrentTime = Math.min(currentTime, safeDuration)

  return createPortal(
    <div className="floating-player">
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          html,
          body {
            background: #181818;
            margin: 0;
            overflow: hidden;
          }

          .floating-player {
            align-items: center;
            background: #181818;
            color: #fff;
            display: grid;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            gap: 12px;
            grid-template-columns: clamp(56px, 18vmin, 84px) minmax(0, 1fr) auto;
            height: 100vh;
            min-height: 112px;
            min-width: 260px;
            overflow: hidden;
            padding: clamp(8px, 3vmin, 14px);
            width: 100vw;
          }

          .floating-cover {
            aspect-ratio: 1;
            border-radius: 6px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
            height: auto;
            object-fit: cover;
            width: 100%;
          }

          .floating-title {
            font-size: clamp(13px, 4vmin, 16px);
            font-weight: 700;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .floating-artist {
            color: #b3b3b3;
            font-size: clamp(11px, 3vmin, 12px);
            margin-top: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .floating-progress {
            align-items: center;
            display: grid;
            gap: 6px;
            grid-template-columns: auto minmax(44px, 1fr) auto;
            margin-top: 12px;
          }

          .floating-time {
            color: #b3b3b3;
            font-size: 11px;
            line-height: 1;
            min-width: 31px;
          }

          .floating-range {
            accent-color: #1ed760;
            appearance: none;
            background: transparent;
            border-radius: 999px;
            cursor: pointer;
            height: 8px;
            margin: 0;
            width: 100%;
          }

          .floating-range::-webkit-slider-runnable-track {
            background: transparent;
            border-radius: 999px;
            height: 2px;
          }

          .floating-range::-webkit-slider-thumb {
            appearance: none;
            background: #1ed760;
            border: 0;
            border-radius: 999px;
            height: 8px;
            margin-top: -3px;
            width: 8px;
          }

          .floating-range::-moz-range-track {
            background: transparent;
            border: 0;
            border-radius: 999px;
            height: 2px;
          }

          .floating-range::-moz-range-progress {
            background: #1ed760;
            border-radius: 999px;
            height: 2px;
          }

          .floating-range::-moz-range-thumb {
            background: #1ed760;
            border: 0;
            border-radius: 999px;
            height: 8px;
            width: 8px;
          }

          .floating-actions {
            align-items: center;
            display: flex;
            gap: 4px;
          }

          .floating-icon-button,
          .floating-play-button {
            align-items: center;
            border: 0;
            border-radius: 999px;
            cursor: pointer;
            display: flex;
            justify-content: center;
          }

          .floating-play-button {
            background: #fff;
            color: #000;
            height: clamp(38px, 12vmin, 48px);
            width: clamp(38px, 12vmin, 48px);
          }

          .floating-icon-button {
            background: transparent;
            color: #b3b3b3;
            height: clamp(28px, 10vmin, 36px);
            width: clamp(28px, 10vmin, 36px);
          }

          .floating-icon-button:hover {
            color: #fff;
          }

          @media (max-width: 330px) {
            .floating-player {
              grid-template-columns: clamp(44px, 17vmin, 60px) minmax(0, 1fr);
              grid-template-rows: 1fr auto;
            }

            .floating-actions {
              grid-column: 1 / -1;
              justify-content: center;
            }
          }

          @media (max-height: 125px) {
            .floating-player {
              grid-template-columns: clamp(44px, 20vmin, 58px) minmax(0, 1fr) auto;
              padding: 8px;
            }

            .floating-progress {
              gap: 6px;
              margin-top: 6px;
            }
          }

          @media (max-height: 95px), (max-width: 260px) {
            .floating-cover,
            .floating-progress {
              display: none;
            }

            .floating-player {
              grid-template-columns: minmax(0, 1fr) auto;
              min-height: 74px;
            }
          }
        `}
      </style>
      {/* biome-ignore lint/performance/noImgElement: rendered into an external Picture-in-Picture document */}
      <img alt={title} className="floating-cover" src={coverUrl} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="floating-title">{title}</div>
        <div className="floating-artist">{artist}</div>

        <div className="floating-progress">
          <span className="floating-time" style={{ textAlign: 'right' }}>
            {formatTime(currentTime)}
          </span>
          <input
            aria-label="Seek track"
            className="floating-range"
            max={safeDuration}
            min={0}
            onChange={(event) => onSeek(Number(event.currentTarget.value))}
            step={0.1}
            style={{
              borderRadius: 999,
              background: `linear-gradient(to right, #1ed760 0%, #1ed760 ${progress}%, rgba(255,255,255,0.18) ${progress}%, rgba(255,255,255,0.18) 100%)`,
            }}
            type="range"
            value={safeCurrentTime}
          />
          <span className="floating-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="floating-actions">
        <button
          aria-label="Previous track"
          className="floating-icon-button"
          onClick={onPrevious}
          type="button"
        >
          <SkipBack fill="currentColor" size={18} />
        </button>
        <button
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="floating-play-button"
          onClick={onPlayPause}
          type="button"
        >
          {isPlaying ? (
            <Pause fill="currentColor" size={20} />
          ) : (
            <Play fill="currentColor" size={20} />
          )}
        </button>
        <button
          aria-label="Next track"
          className="floating-icon-button"
          onClick={onNext}
          type="button"
        >
          <SkipForward fill="currentColor" size={18} />
        </button>
        <button
          aria-label="Close floating player"
          className="floating-icon-button"
          onClick={onClose}
          type="button"
        >
          <X size={16} />
        </button>
      </div>
    </div>,
    targetWindow.document.body,
  )
}
