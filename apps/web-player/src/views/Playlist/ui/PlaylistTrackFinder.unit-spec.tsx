import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const { useSearch } = vi.hoisted(() => ({ useSearch: vi.fn() }))

vi.mock('@/features/Search', () => ({ useSearch }))
vi.mock('@entities/Artist', () => ({ ArtistName: () => 'Resolved artist' }))

import { PlaylistTrackFinder } from './PlaylistTrackFinder'

const result = (id: string, title: string, artistName: string | null) => ({
  artistId: `artist-${id}`,
  artistName,
  cover: null,
  id,
  rank: 1,
  title,
})

describe('PlaylistTrackFinder', () => {
  it('offers tracks the catalogue search finds, minus the ones already added', () => {
    useSearch.mockReturnValue({
      data: {
        tracks: [
          result('t1', 'Roxbury', 'sevag_h'),
          result('t2', 'Crawlspace', 'sidewalks'),
        ],
      },
      isFetching: false,
    })
    const onAddTrack = vi.fn()

    render(
      <PlaylistTrackFinder
        addingTrackId={null}
        existingTrackIds={new Set(['t2'])}
        onAddTrack={onAddTrack}
        playlistTitle="Mix"
      />,
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'sevag' },
    })

    expect(useSearch).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: 'sevag', types: ['tracks'] }),
    )
    expect(screen.getByText('sevag_h')).toBeInTheDocument()
    expect(screen.queryByText('Crawlspace')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Roxbury/ }))
    expect(onAddTrack).toHaveBeenCalledWith(
      expect.objectContaining({ id: 't1' }),
    )
  })

  it('waits for two characters before searching', () => {
    useSearch.mockReturnValue({ data: undefined, isFetching: false })

    render(
      <PlaylistTrackFinder
        addingTrackId={null}
        existingTrackIds={new Set()}
        onAddTrack={vi.fn()}
        playlistTitle="Mix"
      />,
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 's' } })

    expect(useSearch).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: '' }),
    )
  })
})
