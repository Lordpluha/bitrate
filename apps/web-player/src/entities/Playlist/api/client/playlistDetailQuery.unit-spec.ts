import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@shared/api/client', () => ({
  clientFetchClient: { GET: get },
  queryOptions: (method: string, path: string, init: unknown) => ({
    queryKey: [method, path, init],
  }),
  useQuery: vi.fn(),
}))

import { playlistDetailQuery } from './usePlaylistQueries'

describe('playlistDetailQuery', () => {
  it('revalidates with the API instead of reusing the browser cache', async () => {
    /**
     * The API marks playlists cacheable for 30s; a refetch after adding a track must not get
     * the browser's stale copy, or the page keeps offering the track and adds it twice.
     */
    get.mockResolvedValue({
      data: { id: 'playlist-1', title: 'Mix', tracks: [] },
      response: new Response(null, { status: 200 }),
    })

    await new QueryClient().fetchQuery(playlistDetailQuery('playlist-1'))

    expect(get).toHaveBeenCalledWith(
      '/api/v1/playlists/{id}',
      expect.objectContaining({
        cache: 'no-cache',
        params: { path: { id: 'playlist-1' } },
      }),
    )
  })
})
