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

    fireEvent.click(screen.getByRole('button', { name: 'Play Nightcall' }))

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
