import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TrackAnnouncer } from './TrackAnnouncer'

describe('TrackAnnouncer', () => {
  it('announces the playing track politely and follows a change of track', () => {
    const { rerender } = render(<TrackAnnouncer title="Afterglow" />)
    const region = screen.getByText('Now playing Afterglow')

    expect(region.getAttribute('aria-live')).toBe('polite')

    rerender(<TrackAnnouncer title="Night Signal" />)
    expect(region.textContent).toBe('Now playing Night Signal')
  })
})
