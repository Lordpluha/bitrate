import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PlaybackProgress } from './PlaybackProgress'

const mockSliderRect = (slider: HTMLElement) =>
  vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
    bottom: 10,
    height: 10,
    left: 0,
    right: 100,
    top: 0,
    width: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })

describe('PlaybackProgress', () => {
  it('reports progress and seeks with the keyboard', () => {
    const onSeek = vi.fn()

    render(<PlaybackProgress currentTime={30} duration={120} onSeek={onSeek} />)

    const slider = screen.getByRole('slider', { name: 'Seek playback' })
    expect(slider).toHaveAttribute('aria-valuetext', '0:30 of 2:00')

    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onSeek).toHaveBeenCalledWith(35)
  })

  it('ignores another pointer ending before the active drag', () => {
    const onSeek = vi.fn()
    render(<PlaybackProgress currentTime={0} duration={100} onSeek={onSeek} />)
    const slider = screen.getByRole('slider', { name: 'Seek playback' })
    mockSliderRect(slider)

    fireEvent.pointerDown(slider, {
      clientX: 20,
      isPrimary: true,
      pointerId: 1,
    })
    fireEvent.pointerUp(window, { clientX: 80, pointerId: 2 })
    expect(onSeek).not.toHaveBeenCalled()

    fireEvent.pointerUp(window, { clientX: 60, pointerId: 1 })
    expect(onSeek).toHaveBeenCalledOnce()
    expect(onSeek).toHaveBeenCalledWith(60)
  })

  it('clears a cancelled drag without seeking', () => {
    const onSeek = vi.fn()
    render(<PlaybackProgress currentTime={10} duration={100} onSeek={onSeek} />)
    const slider = screen.getByRole('slider', { name: 'Seek playback' })
    mockSliderRect(slider)

    fireEvent.pointerDown(slider, {
      clientX: 20,
      isPrimary: true,
      pointerId: 1,
    })
    fireEvent.pointerCancel(window, { clientX: 70, pointerId: 1 })

    expect(onSeek).not.toHaveBeenCalled()
    expect(slider).toHaveAttribute('aria-valuenow', '10')
  })

  it('ignores non-primary mouse buttons', () => {
    const onSeek = vi.fn()
    render(<PlaybackProgress currentTime={10} duration={100} onSeek={onSeek} />)
    const slider = screen.getByRole('slider', { name: 'Seek playback' })
    mockSliderRect(slider)

    fireEvent.pointerDown(slider, {
      button: 2,
      clientX: 80,
      pointerId: 1,
    })
    fireEvent.pointerUp(window, { clientX: 80, pointerId: 1 })

    expect(onSeek).not.toHaveBeenCalled()
  })
})
