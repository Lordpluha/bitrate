'use client'

import { usePlayerStore } from '@entities/Player'
import { useEffect } from 'react'

export type UsePlayerHotkeysInput = {
  currentTime: number
  duration: number
  isEnabled: boolean
  onNext: () => void
  onOpenQueue: () => void
  onPrevious: () => void
  onSeek: (time: number) => void
  onToggleLike: () => void
  onToggleShuffle: () => void
  onTogglePlay: () => void
  volume: number
}

const SEEK_STEP_SECONDS = 5
const LONG_SEEK_STEP_SECONDS = 10
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

/** Volume up/down on the main row and the keypad, beside the arrows. */
const VOLUME_UP_CODES = new Set(['Equal', 'NumpadAdd'])
const VOLUME_DOWN_CODES = new Set(['Minus', 'NumpadSubtract'])

/**
 * Global playback shortcuts.
 * Space toggles playback; arrows seek 5 s (10 s with Shift) and change volume, as do + and −;
 * Ctrl/⌘ with an arrow skips tracks; M/S/R/L/Q map to mute, shuffle, repeat, like and the queue.
 */
export const usePlayerHotkeys = ({
  currentTime,
  duration,
  isEnabled,
  onNext,
  onOpenQueue,
  onPrevious,
  onSeek,
  onToggleLike,
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
      const seekStep = event.shiftKey
        ? LONG_SEEK_STEP_SECONDS
        : SEEK_STEP_SECONDS

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
          onSeek(clamp(currentTime + seekStep, 0, duration || 0))
          return
        case 'ArrowLeft':
          event.preventDefault()
          if (withModifier) {
            onPrevious()
            return
          }
          onSeek(clamp(currentTime - seekStep, 0, duration || 0))
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

      if (withModifier) return

      if (VOLUME_UP_CODES.has(event.code)) {
        event.preventDefault()
        setVolume(clamp(volume + VOLUME_STEP, 0, 1))
        return
      }

      if (VOLUME_DOWN_CODES.has(event.code)) {
        event.preventDefault()
        setVolume(clamp(volume - VOLUME_STEP, 0, 1))
        return
      }

      if (event.shiftKey) return

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
        return
      }

      if (event.code === 'KeyL') {
        event.preventDefault()
        onToggleLike()
        return
      }

      if (event.code === 'KeyQ') {
        event.preventDefault()
        onOpenQueue()
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
    onOpenQueue,
    onPrevious,
    onSeek,
    onToggleLike,
    onToggleShuffle,
    onTogglePlay,
    setVolume,
    volume,
  ])
}
