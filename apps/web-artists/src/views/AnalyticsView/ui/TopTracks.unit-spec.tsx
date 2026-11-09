import type { ArtistAnalytics } from '@entities/analytics'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TopTracks } from './TopTracks'

const get = vi.hoisted(() => vi.fn())
vi.mock('@shared/api/fetchClient', () => ({ clientFetchClient: { GET: get } }))
vi.mock('@shared/lib/artworkAmbience', () => ({ useArtworkAmbience: vi.fn() }))

const tracks = Array.from({ length: 12 }, (_, index) => ({
  trackId: `019a0000-0000-7000-8000-${String(index + 1).padStart(12, '0')}`,
  title: `Track ${index + 1}`,
  cover: null,
  plays: 100 - index,
  listeners: 1,
}))
const overview: ArtistAnalytics = {
  state: 'READY',
  period: {
    from: '2026-10-01T00:00:00.000Z',
    to: '2026-10-28T00:00:00.000Z',
    days: 28,
    timezone: 'UTC',
  },
  freshness: '2026-10-28T00:00:00.000Z',
  totals: { plays: 1000, listeners: 1 },
  previous: { plays: 0, listeners: 0 },
  daily: [],
  topTracks: [],
  external: [],
}

function show() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  const view = (data: ArtistAnalytics) => (
    <QueryClientProvider client={client}>
      <TopTracks artistId="artist-1" data={data} />
    </QueryClientProvider>
  )
  const { rerender } = render(view(overview))
  return Object.assign(userEvent.setup(), {
    showPeriod: (days: number) =>
      rerender(view({ ...overview, period: { ...overview.period, days } })),
  })
}

describe('Top tracks pagination', () => {
  beforeEach(() => {
    get.mockReset()
    get.mockImplementation(
      (
        _path: string,
        options: { params: { query: { page: number; days: number } } },
      ) => {
        const { page, days } = options.params.query
        return Promise.resolve({
          response: { ok: true },
          data: {
            data: tracks.slice((page - 1) * 5, page * 5),
            page,
            days,
            limit: 5,
            total: 12,
            maxPlays: 100,
          },
        })
      },
    )
  })

  it('opens tracks beyond the former top ten, keeps global ranks and bar scale, and navigates back', async () => {
    const user = show()
    await screen.findByText('Track 1', { exact: true })
    expect(
      screen.queryByText('Track 6', { exact: true }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Page 2' }))
    await screen.findByText('Track 6', { exact: true })
    const sixth = screen.getByText('Track 6', { exact: true }).closest('tr')
    expect(sixth).not.toBeNull()
    if (!sixth) throw new Error('Expected a track row')
    expect(within(sixth).getByRole('cell', { name: '6' })).toBeVisible()
    expect(sixth.querySelector('.artist-analytics-bar > span')).toHaveStyle({
      width: '95%',
    })
    await user.click(screen.getByRole('button', { name: 'Page 3' }))
    await screen.findByText('Track 12', { exact: true })
    expect(screen.getByText('11–12 of 12')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Previous' }))
    await screen.findByText('Track 6', { exact: true })
    expect(
      screen.queryByText('Track 12', { exact: true }),
    ).not.toBeInTheDocument()
    expect(get).toHaveBeenCalledWith(
      '/api/v1/artists/me/analytics/top-tracks',
      expect.objectContaining({ params: { query: { days: 28, page: 3 } } }),
    )
  })

  it('hides pagination when a single page is sufficient', async () => {
    get.mockResolvedValue({
      response: { ok: true },
      data: {
        data: tracks.slice(0, 2),
        page: 1,
        days: 28,
        limit: 5,
        total: 2,
        maxPlays: 100,
      },
    })
    show()
    await screen.findByText('Track 2', { exact: true })
    expect(
      screen.queryByRole('navigation', { name: 'Top tracks pages' }),
    ).not.toBeInTheDocument()
  })

  it('shows a failed read without claiming an empty list and supports retry', async () => {
    get.mockResolvedValueOnce({ response: { ok: false }, data: undefined })
    const user = show()
    await screen.findByRole('alert')
    expect(
      screen.queryByText('No plays in this period.'),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() =>
      expect(screen.getByText('Track 1', { exact: true })).toBeVisible(),
    )
  })

  it('starts another period at its first page', async () => {
    const user = show()
    await screen.findByText('Track 1', { exact: true })
    await user.click(screen.getByRole('button', { name: 'Page 3' }))
    await screen.findByText('Track 12', { exact: true })
    user.showPeriod(7)
    await screen.findByText('Track 1', { exact: true })
    expect(get).toHaveBeenLastCalledWith(
      '/api/v1/artists/me/analytics/top-tracks',
      expect.objectContaining({ params: { query: { days: 7, page: 1 } } }),
    )
  })
})
