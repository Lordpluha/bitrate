import { describe, expect, it } from 'vitest'
import { normalizeSearchResponse } from './hooks'
import { searchResponseSchema } from './search.schemas'

describe('normalizeSearchResponse', () => {
  it('keeps the artist name the search returns for a track', () => {
    const parsed = searchResponseSchema.parse({
      data: {
        tracks: [
          {
            id: 't1',
            title: 'Night Signal',
            subtitle: 'Mira Sol',
            image: null,
            type: 'tracks',
            artistId: 'a1',
            ownerId: null,
            rank: 0.9,
          },
        ],
      },
      totals: { tracks: 1 },
      total: 1,
      page: 1,
      limit: 10,
      limitPerType: 10,
      topResult: null,
    })

    expect(normalizeSearchResponse(parsed).tracks[0]).toMatchObject({
      artistId: 'a1',
      artistName: 'Mira Sol',
    })
  })
})
