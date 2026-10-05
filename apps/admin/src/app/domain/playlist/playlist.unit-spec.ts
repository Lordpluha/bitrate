import { describe, expect, it } from 'vitest'
import {
  canHidePlaylist,
  canRestorePlaylist,
  canTakeDownPlaylist,
  canUnhidePlaylist,
  type Playlist,
} from './playlist'

function playlist(overrides: Partial<Playlist> = {}): Playlist {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Night Drive',
    ownerId: '9f2504e0-4f89-41d3-9a0c-0305e82c3302',
    ownerUsername: 'listener',
    isPublic: true,
    followersCount: 3,
    trackCount: 2,
    takenDownAt: null,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
    ...overrides,
  }
}

describe('playlist policy', () => {
  it('allows hiding a public playlist and refuses a private one', () => {
    expect(canHidePlaylist(playlist()).allowed).toBe(true)
    expect(canHidePlaylist(playlist({ isPublic: false }))).toEqual({
      allowed: false,
      reason: '"Night Drive" is already hidden.',
    })
  })

  it('allows un-hiding a private playlist and refuses a public one', () => {
    expect(canUnhidePlaylist(playlist({ isPublic: false })).allowed).toBe(true)
    expect(canUnhidePlaylist(playlist())).toEqual({
      allowed: false,
      reason: '"Night Drive" is already public.',
    })
  })

  it('allows taking down an active playlist and refuses one already taken down', () => {
    expect(canTakeDownPlaylist(playlist()).allowed).toBe(true)
    expect(canTakeDownPlaylist(playlist({ takenDownAt: new Date() }))).toEqual({
      allowed: false,
      reason: '"Night Drive" is already taken down.',
    })
  })

  it('allows restoring a taken-down playlist and refuses an active one', () => {
    expect(canRestorePlaylist(playlist({ takenDownAt: new Date() })).allowed).toBe(true)
    expect(canRestorePlaylist(playlist())).toEqual({
      allowed: false,
      reason: '"Night Drive" is not taken down.',
    })
  })

  it('treats hide and take-down as independent', () => {
    const both = playlist({ isPublic: false, takenDownAt: new Date() })

    expect(canUnhidePlaylist(both).allowed).toBe(true)
    expect(canRestorePlaylist(both).allowed).toBe(true)
    expect(canHidePlaylist(both).allowed).toBe(false)
    expect(canTakeDownPlaylist(both).allowed).toBe(false)
  })
})
