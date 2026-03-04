'use client'

import { cn } from '@spotify/ui-react'
import {
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import React, { useCallback, useRef, useState } from 'react'

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

export const PlayerControls: React.FC<PlayerControlsProps> = ({
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
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [seekTime, setSeekTime] = useState<number | null>(null)

  const formatTime = (seconds: number) => {
    if (Number.isNaN(seconds) || !Number.isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateTime = useCallback(
    (e: MouseEvent | React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current || !duration) return null

      const rect = progressBarRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(1, clickX / rect.width))
      return percentage * duration
    },
    [duration],
  )

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return
    const newTime = calculateTime(e)
    if (newTime !== null) {
      onSeek(newTime)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    const newTime = calculateTime(e)
    if (newTime !== null) {
      setSeekTime(newTime)
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      const newTime = calculateTime(e)
      if (newTime !== null) {
        setSeekTime(newTime)
      }
    },
    [isDragging, calculateTime],
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging && seekTime !== null) {
      onSeek(seekTime)
    }
    setIsDragging(false)
    setSeekTime(null)
  }, [isDragging, seekTime, onSeek])

  const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!duration) return

    const current = seekTime !== null ? seekTime : currentTime
    const step = 5

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onSeek(Math.max(0, current - step))
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      onSeek(Math.min(duration, current + step))
    }
  }

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div className="flex-1 flex flex-col items-center gap-2 max-w-180.5">
      <div className="flex items-center gap-4">
        <button
          className={cn(
            'p-1 hover:scale-110 transition-transform',
            isShuffled ? 'text-green-500' : 'text-gray-400',
          )}
          onClick={onShuffleToggle}
          type="button"
        >
          <Shuffle size={16} />
        </button>

        <button
          className="p-1 text-gray-400 hover:text-white hover:scale-110 transition-all"
          onClick={onPrevious}
          type="button"
        >
          <SkipBack size={20} />
        </button>

        <button
          className="w-8 h-8 rounded-full bg-white hover:scale-105 transition-transform flex items-center justify-center"
          onClick={onPlayPause}
          type="button"
        >
          {isPlaying ? (
            <Pause className="text-black" fill="black" size={20} />
          ) : (
            <Play className="text-black ml-0.5" fill="black" size={20} />
          )}
        </button>

        <button
          className="p-1 text-gray-400 hover:text-white hover:scale-110 transition-all"
          onClick={onNext}
          type="button"
        >
          <SkipForward size={20} />
        </button>

        <button
          className={cn(
            'p-1 hover:scale-110 transition-transform',
            repeatMode !== 'off' ? 'text-green-500' : 'text-gray-400',
          )}
          onClick={onRepeatToggle}
          type="button"
        >
          <Repeat size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2 w-full">
        <span className="text-xs text-gray-400 min-w-10 text-right">
          {formatTime(seekTime !== null ? seekTime : currentTime)}
        </span>
        <div
          aria-label="Seek track"
          aria-valuemax={Math.max(0, duration)}
          aria-valuemin={0}
          aria-valuenow={Math.max(0, seekTime !== null ? seekTime : currentTime)}
          className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer group relative"
          onClick={handleProgressClick}
          onKeyDown={handleProgressKeyDown}
          onMouseDown={handleMouseDown}
          ref={progressBarRef}
          role="slider"
          tabIndex={0}
        >
          <div
            className="absolute top-0 left-0 h-full bg-white group-hover:bg-green-500 rounded-full pointer-events-none transition-colors"
            style={{
              width: `${duration && Number.isFinite(duration) ? ((seekTime !== null ? seekTime : currentTime) / duration) * 100 : 0}%`,
            }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <span className="text-xs text-gray-400 min-w-10">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}
