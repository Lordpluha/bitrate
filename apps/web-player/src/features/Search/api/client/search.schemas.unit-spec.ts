import { describe, expect, it } from 'vitest'

import { normalizeSearchResponse } from './hooks'
import { searchResponseSchema } from './search.schemas'

describe('search response contract', () => {
  it('keeps relationship UUIDs separate from presentation subtitles', () => {
    const artistId = '8f57987e-f3d4-4ac4-a494-d4e8311ff0fd'
    const ownerId = 'ff963b39-b327-4eb4-b2e0-71d695182d35'
    const parsed = searchResponseSchema.parse({
      data: {
        albums: [],
        artists: [],
        playlists: [
          {
            artistId: null,
            id: 'playlist-1',
            image: null,
            ownerId,
            rank: 0.7,
            subtitle: 'display-name-that-is-not-a-uuid',
            title: 'Playlist',
            type: 'playlists',
          },
        ],
        tracks: [
          {
            artistId,
            id: 'track-1',
            image: null,
            ownerId: null,
            rank: 0.9,
            subtitle: 'artist-name-that-is-not-a-uuid',
            title: 'Track',
            type: 'tracks',
          },
        ],
      },
      limit: 10,
      limitPerType: 10,
      page: 1,
      topResult: null,
      total: 2,
      totals: { albums: 0, artists: 0, playlists: 1, tracks: 1 },
    })

    const normalized = normalizeSearchResponse(parsed)

    expect(normalized.tracks[0]?.artistId).toBe(artistId)
    expect(normalized.playlists[0]?.userId).toBe(ownerId)
  })
})
