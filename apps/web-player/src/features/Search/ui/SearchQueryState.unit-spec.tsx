import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchQueryState } from './SearchQueryState'

const emptyData = {
  albums: [],
  artists: [],
  playlists: [],
  tracks: [],
}

describe('SearchQueryState', () => {
  it('distinguishes a request failure from an empty result', () => {
    const onRetry = vi.fn()

    render(
      <SearchQueryState
        data={emptyData}
        hasError
        isFetching={false}
        onRetry={onRetry}
        query="nightcall"
        users={[]}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Search is unavailable')
    expect(screen.queryByText(/No results found/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows the empty state after a successful request', () => {
    render(
      <SearchQueryState
        data={emptyData}
        hasError={false}
        isFetching={false}
        onRetry={vi.fn()}
        query="nightcall"
        users={[]}
      />,
    )

    expect(screen.getByText(/No results found/)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
