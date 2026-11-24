import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ArtistCountdownTile } from './ArtistCountdownTile'

const countdown = vi.hoisted(() => ({ data: null as unknown }))

vi.mock('@entities/Artist', () => ({
  useArtistCountdown: () => ({ data: countdown.data }),
  FollowArtistButton: () => <button type="button">Follow</button>,
}))

describe('ArtistCountdownTile', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-01T12:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('shows nothing without an approved countdown', () => {
    countdown.data = null
    const { container } = render(
      <ArtistCountdownTile artistId="artist-1" artistName="Luma Vale" />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the title, the date and the days left, and nothing else of the release', () => {
    countdown.data = {
      releaseId: 'release-1',
      title: 'Afterglow',
      cover: null,
      releaseAt: '2026-12-10T18:00:00Z',
    }
    render(<ArtistCountdownTile artistId="artist-1" artistName="Luma Vale" />)

    expect(
      screen.getByRole('heading', { name: 'Afterglow' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/New release · Coming Dec 10/)).toBeInTheDocument()
    expect(screen.getByText('in 10 days')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument()
  })
})
