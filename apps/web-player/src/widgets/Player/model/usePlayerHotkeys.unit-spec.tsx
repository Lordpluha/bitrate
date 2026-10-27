import { usePlayerStore } from '@entities/Player'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isPlayerHotkeyTarget, usePlayerHotkeys } from './usePlayerHotkeys'

const renderHotkeys = () => {
  const onTogglePlay = vi.fn()
  const onToggleShuffle = vi.fn()
  const onSeek = vi.fn()
  const onToggleLike = vi.fn()
  const onOpenQueue = vi.fn()
  renderHook(() =>
    usePlayerHotkeys({
      currentTime: 30,
      duration: 100,
      isEnabled: true,
      onNext: vi.fn(),
      onOpenQueue,
      onPrevious: vi.fn(),
      onSeek,
      onToggleLike,
      onTogglePlay,
      onToggleShuffle,
      volume: 0.5,
    }),
  )

  return { onOpenQueue, onSeek, onToggleLike, onTogglePlay, onToggleShuffle }
}

describe('isPlayerHotkeyTarget', () => {
  it('recognizes descendants of native and ARIA controls', () => {
    const button = document.createElement('button')
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    button.append(icon)
    const slider = document.createElement('div')
    slider.setAttribute('role', 'slider')
    const editor = document.createElement('div')
    editor.setAttribute('contenteditable', '')
    const editorChild = document.createElement('span')
    editor.append(editorChild)

    expect(isPlayerHotkeyTarget(icon)).toBe(true)
    expect(isPlayerHotkeyTarget(slider)).toBe(true)
    expect(isPlayerHotkeyTarget(editorChild)).toBe(true)
    expect(isPlayerHotkeyTarget(document.createElement('div'))).toBe(false)
  })
})

const press = (code: string, init: KeyboardEventInit = {}) => {
  window.dispatchEvent(new KeyboardEvent('keydown', { code, ...init }))
}

describe('usePlayerHotkeys', () => {
  beforeEach(() => {
    usePlayerStore.getState().reset()
  })

  it('skips 5 s with the arrows and 10 s with Shift', () => {
    const { onSeek } = renderHotkeys()

    press('ArrowRight')
    press('ArrowLeft')
    press('ArrowRight', { shiftKey: true })
    press('ArrowLeft', { shiftKey: true })

    expect(onSeek.mock.calls).toEqual([[35], [25], [40], [20]])
  })

  it('likes the track with L and opens the queue with Q', () => {
    const { onOpenQueue, onToggleLike } = renderHotkeys()

    press('KeyL')
    press('KeyQ')

    expect(onToggleLike).toHaveBeenCalledOnce()
    expect(onOpenQueue).toHaveBeenCalledOnce()
  })

  it('raises and lowers the volume with + and −, on the main row and the keypad', () => {
    renderHotkeys()

    press('Equal')
    expect(usePlayerStore.getState().volume).toBeCloseTo(0.55)
    press('NumpadSubtract')
    expect(usePlayerStore.getState().volume).toBeCloseTo(0.45)
  })

  it('delegates shuffle to the shared controller action', () => {
    const { onToggleShuffle } = renderHotkeys()

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyS' }))

    expect(onToggleShuffle).toHaveBeenCalledOnce()
  })

  it('does not handle Space from a focused button', () => {
    const { onTogglePlay } = renderHotkeys()
    const button = document.createElement('button')
    document.body.append(button)

    button.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, code: 'Space' }),
    )

    expect(onTogglePlay).not.toHaveBeenCalled()
    button.remove()
  })
})
