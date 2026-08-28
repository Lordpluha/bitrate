import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { isPlayerHotkeyTarget, usePlayerHotkeys } from './usePlayerHotkeys'

const renderHotkeys = () => {
  const onTogglePlay = vi.fn()
  const onToggleShuffle = vi.fn()
  renderHook(() =>
    usePlayerHotkeys({
      currentTime: 10,
      duration: 100,
      isEnabled: true,
      onNext: vi.fn(),
      onPrevious: vi.fn(),
      onSeek: vi.fn(),
      onTogglePlay,
      onToggleShuffle,
      volume: 0.5,
    }),
  )

  return { onTogglePlay, onToggleShuffle }
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

describe('usePlayerHotkeys', () => {
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
