import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PlaybackProgress } from './PlaybackProgress'

describe('PlaybackProgress', () => {
  it('reports progress and seeks with the keyboard', () => {
    const onSeek = vi.fn()

    render(<PlaybackProgress currentTime={30} duration={120} onSeek={onSeek} />)

    const slider = screen.getByRole('slider', { name: 'Seek playback' })
    expect(slider).toHaveAttribute('aria-valuetext', '0:30 of 2:00')

    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onSeek).toHaveBeenCalledWith(35)
  })
})
