import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TrackPlayIndicator } from './TrackPlayIndicator'

describe('TrackPlayIndicator', () => {
  it('exposes the track action and calls it', () => {
    const onClick = vi.fn()

    render(
      <TrackPlayIndicator
        index={0}
        isCurrent={false}
        isPlaying={false}
        onClick={onClick}
        title="Nightcall"
      />,
    )

    /** The visible track number leads the name, so speech input can say it (WCAG 2.5.3). */
    fireEvent.click(screen.getByRole('button', { name: '1. Play Nightcall' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('announces pause for the currently playing track', () => {
    render(
      <TrackPlayIndicator
        index={0}
        isCurrent
        isPlaying
        onClick={vi.fn()}
        title="Nightcall"
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Pause Nightcall' }),
    ).toBeInTheDocument()
  })
})
