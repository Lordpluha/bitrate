'use client'

import {
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

type PlaybackProgressProps = {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '0:00'

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const PlaybackProgress = ({
  currentTime,
  duration,
  onSeek,
}: PlaybackProgressProps) => {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [seekTime, setSeekTime] = useState<number | null>(null)
  const [activePointerId, setActivePointerId] = useState<number | null>(null)
  const displayedTime = seekTime ?? currentTime

  const calculateTime = useCallback(
    (clientX: number) => {
      const rect = progressBarRef.current?.getBoundingClientRect()
      if (!rect || !duration) return null

      const percentage = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      )
      return percentage * duration
    },
    [duration],
  )

  useEffect(() => {
    if (activePointerId === null) return

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return
      const time = calculateTime(event.clientX)
      if (time !== null) setSeekTime(time)
    }
    const handlePointerEnd = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return
      const time = calculateTime(event.clientX) ?? seekTime
      if (time !== null) onSeek(time)
      setActivePointerId(null)
      setSeekTime(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerEnd, { once: true })
    window.addEventListener('pointercancel', handlePointerEnd, { once: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerEnd)
      window.removeEventListener('pointercancel', handlePointerEnd)
    }
  }, [activePointerId, calculateTime, onSeek, seekTime])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setActivePointerId(event.pointerId)
    setSeekTime(calculateTime(event.clientX))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!duration) return

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      const direction = event.key === 'ArrowLeft' ? -1 : 1
      onSeek(Math.max(0, Math.min(duration, displayedTime + direction * 5)))
    }
  }

  const progress =
    duration > 0 && Number.isFinite(duration)
      ? Math.min(100, Math.max(0, (displayedTime / duration) * 100))
      : 0

  return (
    <div className="flex w-full items-center gap-2">
      <span className="min-w-10 text-right text-xs tabular-nums text-text-subdued">
        {formatTime(displayedTime)}
      </span>
      <div
        aria-label="Seek playback"
        aria-valuemax={duration || 0}
        aria-valuemin={0}
        aria-valuenow={displayedTime}
        aria-valuetext={`${formatTime(displayedTime)} of ${formatTime(duration)}`}
        className="group relative h-1 flex-1 cursor-pointer touch-none rounded-full bg-border"
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        ref={progressBarRef}
        role="slider"
        tabIndex={0}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-text transition-colors group-hover:bg-primary"
          style={{ width: `${progress}%` }}
        >
          <span className="absolute right-0 top-1/2 size-3 -translate-y-1/2 rounded-full bg-text opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        </div>
      </div>
      <span className="min-w-10 text-xs tabular-nums text-text-subdued">
        {formatTime(duration)}
      </span>
    </div>
  )
}
