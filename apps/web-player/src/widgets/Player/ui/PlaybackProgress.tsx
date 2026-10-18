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
  const activePointerIdRef = useRef<number | null>(null)
  const seekTimeRef = useRef<number | null>(null)
  const [seekTime, setSeekTime] = useState<number | null>(null)
  const [activePointerId, setActivePointerId] = useState<number | null>(null)
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0
  const rawDisplayedTime = seekTime ?? currentTime
  const displayedTime = Number.isFinite(rawDisplayedTime)
    ? Math.max(0, Math.min(safeDuration, rawDisplayedTime))
    : 0

  const calculateTime = useCallback(
    (clientX: number) => {
      const rect = progressBarRef.current?.getBoundingClientRect()
      if (!rect || rect.width <= 0 || safeDuration === 0) return null

      const percentage = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      )
      return percentage * safeDuration
    },
    [safeDuration],
  )

  const clearPointer = useCallback((pointerId: number) => {
    if (activePointerIdRef.current !== pointerId) return
    activePointerIdRef.current = null
    seekTimeRef.current = null
    setActivePointerId(null)
    setSeekTime(null)
  }, [])

  useEffect(() => {
    if (activePointerId === null) return

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return
      const time = calculateTime(event.clientX)
      if (time !== null) {
        seekTimeRef.current = time
        setSeekTime(time)
      }
    }
    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return
      const time = calculateTime(event.clientX) ?? seekTimeRef.current
      if (time !== null) onSeek(time)
      clearPointer(event.pointerId)
    }
    const handlePointerCancel = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return
      clearPointer(event.pointerId)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
    }
  }, [activePointerId, calculateTime, clearPointer, onSeek])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== null) return
    if (
      event.isPrimary === false ||
      (event.button !== undefined && event.button !== 0)
    ) {
      return
    }
    const time = calculateTime(event.clientX)
    if (time === null) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    activePointerIdRef.current = event.pointerId
    seekTimeRef.current = time
    setActivePointerId(event.pointerId)
    setSeekTime(time)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (safeDuration === 0) return

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      const direction = event.key === 'ArrowLeft' ? -1 : 1
      onSeek(Math.max(0, Math.min(safeDuration, displayedTime + direction * 5)))
    }
  }

  const progress =
    safeDuration > 0
      ? Math.min(100, Math.max(0, (displayedTime / safeDuration) * 100))
      : 0

  return (
    <div className="flex w-full items-center gap-2.5">
      <span className="min-w-7 text-right text-[11px] tabular-nums text-muted-foreground">
        {formatTime(displayedTime)}
      </span>
      <div
        aria-label="Seek playback"
        aria-valuemax={safeDuration}
        aria-valuemin={0}
        aria-valuenow={displayedTime}
        aria-valuetext={`${formatTime(displayedTime)} of ${formatTime(safeDuration)}`}
        className="group relative flex h-3.5 flex-1 cursor-pointer touch-none items-center"
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        ref={progressBarRef}
        role="slider"
        tabIndex={0}
      >
        <div className="relative h-0.75 w-full rounded-full bg-foreground/10">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          >
            <span className="absolute top-1/2 right-0 size-1.75 translate-x-1/2 -translate-y-1/2 rounded-full border border-primary bg-background transition-transform group-hover:scale-150 group-focus-visible:scale-150" />
          </div>
        </div>
      </div>
      <span className="min-w-7 text-[11px] tabular-nums text-muted-foreground">
        {formatTime(safeDuration)}
      </span>
    </div>
  )
}
