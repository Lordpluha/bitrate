import { describe, expect, it } from 'vitest'
import type { Genre } from './genre'
import { canDeleteGenre } from './genre-policy'

function genre(counts: Genre['counts']): Genre {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    slug: 'synthwave',
    name: 'Synthwave',
    description: null,
    color: null,
    counts,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
  }
}

describe('canDeleteGenre', () => {
  it('allows an unreferenced genre', () => {
    expect(canDeleteGenre(genre({ tracks: 0, albums: 0, artists: 0 })).allowed).toBe(true)
  })

  it.each([
    { tracks: 1, albums: 0, artists: 0 },
    { tracks: 0, albums: 2, artists: 0 },
    { tracks: 0, albums: 0, artists: 3 },
  ])('refuses a referenced genre, naming the counts: %o', (counts) => {
    const decision = canDeleteGenre(genre(counts))

    expect(decision.allowed).toBe(false)
    expect(decision).toMatchObject({
      reason: expect.stringContaining(`${counts.tracks} tracks`),
    })
  })
})
