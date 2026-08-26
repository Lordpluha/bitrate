import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ArtistEntity } from '@/entities/Artist'
import { ArtistHero } from './ArtistHero'

const artist: ArtistEntity = {
  avatar: null,
  backgroundImage: null,
  bio: null,
  id: 'artist-1',
  monthlyListeners: 10,
  username: 'Night Drive',
  verified: false,
}

describe('ArtistHero', () => {
  it('does not claim an unverified artist is verified', () => {
    render(<ArtistHero artist={artist} statsLabel="10 monthly listeners" />)

    expect(screen.queryByText('Verified artist')).not.toBeInTheDocument()
  })

  it('shows the badge for a verified artist', () => {
    render(
      <ArtistHero
        artist={{ ...artist, verified: true }}
        statsLabel="10 monthly listeners"
      />,
    )

    expect(screen.getByText('Verified artist')).toBeInTheDocument()
  })
})
