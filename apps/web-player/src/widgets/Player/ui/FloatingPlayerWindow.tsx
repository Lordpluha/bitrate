'use client'

import { Pause, Play, SkipForward, X } from 'lucide-react'
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
  onNext: () => void
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
  onNext,
  onClose,
}: FloatingPlayerWindowProps) => {
  if (!targetWindow || targetWindow.closed) return null

  const progress =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0

  return createPortal(
    <div
      style={{
        alignItems: 'center',
        background: '#181818',
        boxSizing: 'border-box',
        color: '#fff',
        display: 'flex',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        gap: 12,
        height: '100vh',
        margin: 0,
        overflow: 'hidden',
        padding: 12,
        width: '100vw',
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: rendered into an external Picture-in-Picture document */}
      <img
        alt={title}
        src={coverUrl}
        style={{
          borderRadius: 6,
          flexShrink: 0,
          height: 72,
          objectFit: 'cover',
          width: 72,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: '#b3b3b3',
            fontSize: 12,
            marginTop: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {artist}
        </div>

        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 8,
            marginTop: 12,
          }}
        >
          <span style={{ color: '#b3b3b3', fontSize: 11 }}>
            {formatTime(currentTime)}
          </span>
          <div
            style={{
              background: 'rgba(255,255,255,0.18)',
              borderRadius: 999,
              flex: 1,
              height: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: '#1ed760',
                height: '100%',
                width: `${progress}%`,
              }}
            />
          </div>
          <span style={{ color: '#b3b3b3', fontSize: 11 }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div style={{ alignItems: 'center', display: 'flex', gap: 4 }}>
        <button
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={onPlayPause}
          style={{
            alignItems: 'center',
            background: '#fff',
            border: 0,
            borderRadius: 999,
            color: '#000',
            cursor: 'pointer',
            display: 'flex',
            height: 42,
            justifyContent: 'center',
            width: 42,
          }}
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
          onClick={onNext}
          style={{
            alignItems: 'center',
            background: 'transparent',
            border: 0,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            height: 34,
            justifyContent: 'center',
            width: 34,
          }}
          type="button"
        >
          <SkipForward fill="currentColor" size={18} />
        </button>
        <button
          aria-label="Close floating player"
          onClick={onClose}
          style={{
            alignItems: 'center',
            background: 'transparent',
            border: 0,
            color: '#b3b3b3',
            cursor: 'pointer',
            display: 'flex',
            height: 30,
            justifyContent: 'center',
            width: 30,
          }}
          type="button"
        >
          <X size={16} />
        </button>
      </div>
    </div>,
    targetWindow.document.body,
  )
}
