'use client'

import { usePlayerStore } from '@entities/Player'
import { useEffect } from 'react'

export type UsePlayerHotkeysInput = {
  currentTime: number
  duration: number
  isEnabled: boolean
  onNext: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  onTogglePlay: () => void
  volume: number
}

const SEEK_STEP_SECONDS = 5
const VOLUME_STEP = 0.05

/** True when the user is typing, so global shortcuts must not fire. */
const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false

  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  )
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/**
 * Global playback shortcuts.
 * Space toggles playback, arrows seek and change volume, M/S/R map to
 * mute, shuffle and repeat.
 */
export const usePlayerHotkeys = ({
  currentTime,
  duration,
  isEnabled,
  onNext,
  onPrevious,
  onSeek,
  onTogglePlay,
  volume,
}: UsePlayerHotkeysInput) => {
  const setVolume = usePlayerStore((state) => state.setVolume)
  const setShuffleEnabled = usePlayerStore((state) => state.setShuffleEnabled)
  const cycleRepeatMode = usePlayerStore((state) => state.cycleRepeatMode)

  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.altKey) return

      const withModifier = event.metaKey || event.ctrlKey

      switch (event.code) {
        case 'Space':
          event.preventDefault()
          onTogglePlay()
          return
        case 'ArrowRight':
          event.preventDefault()
          if (withModifier) {
            onNext()
            return
          }
          onSeek(clamp(currentTime + SEEK_STEP_SECONDS, 0, duration || 0))
          return
        case 'ArrowLeft':
          event.preventDefault()
          if (withModifier) {
            onPrevious()
            return
          }
          onSeek(clamp(currentTime - SEEK_STEP_SECONDS, 0, duration || 0))
          return
        case 'ArrowUp':
          event.preventDefault()
          setVolume(clamp(volume + VOLUME_STEP, 0, 1))
          return
        case 'ArrowDown':
          event.preventDefault()
          setVolume(clamp(volume - VOLUME_STEP, 0, 1))
          return
        default:
          break
      }

      if (withModifier || event.shiftKey) return

      if (event.code === 'KeyM') {
        event.preventDefault()
        setVolume(volume > 0 ? 0 : 0.5)
        return
      }

      if (event.code === 'KeyS') {
        event.preventDefault()
        setShuffleEnabled(!usePlayerStore.getState().isShuffled)
        return
      }

      if (event.code === 'KeyR') {
        event.preventDefault()
        cycleRepeatMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    currentTime,
    cycleRepeatMode,
    duration,
    isEnabled,
    onNext,
    onPrevious,
    onSeek,
    onTogglePlay,
    setShuffleEnabled,
    setVolume,
    volume,
  ])
}
