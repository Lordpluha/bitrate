import { describe, expect, it } from 'vitest'
import { normalizePlaylistsResponse } from './playlistResponse.schema'

describe('normalizePlaylistsResponse', () => {
  it('unwraps the API pagination envelope', () => {
    const playlists = normalizePlaylistsResponse({
      data: [
        {
          cover: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          description: null,
          id: 'playlist-1',
          isPublic: true,
          title: 'Focus',
          updatedAt: '2026-01-01T00:00:00.000Z',
          userId: 'user-1',
        },
      ],
      limit: 20,
      page: 1,
      total: 1,
    })

    expect(playlists).toHaveLength(1)
    expect(playlists[0]).toMatchObject({ id: 'playlist-1', tracks: [] })
  })
})
