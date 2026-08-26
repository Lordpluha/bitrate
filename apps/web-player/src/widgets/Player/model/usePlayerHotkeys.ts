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
  onToggleShuffle: () => void
  onTogglePlay: () => void
  volume: number
}

const SEEK_STEP_SECONDS = 5
const VOLUME_STEP = 0.05

const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'summary',
  'textarea',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="combobox"]',
  '[role="link"]',
  '[role="listbox"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="radio"]',
  '[role="searchbox"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="switch"]',
  '[role="tab"]',
  '[role="textbox"]',
  '[role="treeitem"]',
].join(',')

/** Global playback shortcuts must never override a focused interactive control. */
export const isPlayerHotkeyTarget = (target: EventTarget | null) =>
  target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null

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
  onToggleShuffle,
  onTogglePlay,
  volume,
}: UsePlayerHotkeysInput) => {
  const setVolume = usePlayerStore((state) => state.setVolume)
  const cycleRepeatMode = usePlayerStore((state) => state.cycleRepeatMode)

  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isPlayerHotkeyTarget(event.target)) return
      if (event.altKey) return

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
        onToggleShuffle()
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
    onToggleShuffle,
    onTogglePlay,
    setVolume,
    volume,
  ])
}
