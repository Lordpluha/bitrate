import { describe, expect, it } from 'vitest'
import { type Album, canRestoreAlbum, canTakeDownAlbum } from './album'

function album(overrides: Partial<Album> = {}): Album {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Night Signal',
    artistId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
    artistUsername: 'dj-test',
    coverUrl: null,
    type: 'ALBUM',
    totalTracks: 2,
    releaseDate: null,
    takenDownAt: null,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
    ...overrides,
  }
}

describe('album policy', () => {
  it('allows taking down an active album and refuses one already taken down', () => {
    expect(canTakeDownAlbum(album()).allowed).toBe(true)
    expect(canTakeDownAlbum(album({ takenDownAt: new Date() }))).toEqual({
      allowed: false,
      reason: '"Night Signal" is already taken down.',
    })
  })

  it('allows restoring a taken-down album and refuses an active one', () => {
    expect(canRestoreAlbum(album({ takenDownAt: new Date() })).allowed).toBe(true)
    expect(canRestoreAlbum(album())).toEqual({
      allowed: false,
      reason: '"Night Signal" is not taken down.',
    })
  })
})
