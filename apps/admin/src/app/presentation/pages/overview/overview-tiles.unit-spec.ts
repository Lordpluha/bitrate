import type { Overview } from '@domain/overview'
import { ROUTE_PERMISSIONS } from '@presentation/guards'
import { describe, expect, it } from 'vitest'
import { buildOverviewTiles } from './overview-tiles'

const OVERVIEW: Overview = {
  reports: { open: 3, reviewing: 1 },
  tracks: { processing: 2, ready: 50, failed: 4, stuck: 1, stuckAfterMs: 1_800_000 },
  deactivated: { users: 2, artists: 0 },
  last7Days: { signups: 5, uploads: 12 },
  recentActivity: [],
}

describe('buildOverviewTiles', () => {
  it('links each report/track tile to the matching filtered list', () => {
    const tiles = buildOverviewTiles(OVERVIEW)

    /**
     * `OPEN` is the moderation queue's own codec default (`moderationQueryCodec`), so a canonical
     * link to it carries no query params at all — encoding it explicitly would round-trip to the
     * same URL, but the codec never emits it.
     */
    expect(tiles.find((tile) => tile.id === 'reports-open')?.link).toEqual({
      path: '/moderation',
      permission: 'reports:read',
    })
    expect(tiles.find((tile) => tile.id === 'reports-reviewing')?.link).toEqual({
      path: '/moderation',
      permission: 'reports:read',
      queryParams: { status: 'REVIEWING' },
    })
    expect(tiles.find((tile) => tile.id === 'tracks-failed')?.link).toEqual({
      path: '/catalog',
      permission: 'tracks:read',
      queryParams: { status: 'FAILED' },
    })
    expect(tiles.find((tile) => tile.id === 'tracks-processing')?.link).toEqual({
      path: '/catalog',
      permission: 'tracks:read',
      queryParams: { status: 'PROCESSING' },
    })
    expect(tiles.find((tile) => tile.id === 'deactivated-users')?.link).toEqual({
      path: '/users',
      permission: 'users:read',
      queryParams: { status: 'deactivated' },
    })
    expect(tiles.find((tile) => tile.id === 'deactivated-artists')?.link).toEqual({
      path: '/artists',
      permission: 'artists:read',
      queryParams: { status: 'deactivated' },
    })
  })

  it('leaves the stuck/last-7-days tiles without a link', () => {
    const tiles = buildOverviewTiles(OVERVIEW)

    for (const id of ['tracks-stuck', 'signups-7d', 'uploads-7d']) {
      expect(tiles.find((tile) => tile.id === id)?.link).toBeUndefined()
    }
  })

  it('renders the stuck hint in whole minutes from stuckAfterMs', () => {
    const tiles = buildOverviewTiles(OVERVIEW)

    expect(tiles.find((tile) => tile.id === 'tracks-stuck')?.hint).toBe('Past 30 min in processing')
  })

  it("binds every linked tile's permission to its target route's own guard", () => {
    const tiles = buildOverviewTiles(OVERVIEW)

    for (const tile of tiles) {
      if (!tile.link) continue
      const route = ROUTE_PERMISSIONS.find((candidate) => candidate.path === tile.link?.path)
      expect(tile.link.permission).toBe(route?.permission)
    }
  })

  it('renders every count, including zero, against an empty database', () => {
    const tiles = buildOverviewTiles({
      reports: { open: 0, reviewing: 0 },
      tracks: { processing: 0, ready: 0, failed: 0, stuck: 0, stuckAfterMs: 1_800_000 },
      deactivated: { users: 0, artists: 0 },
      last7Days: { signups: 0, uploads: 0 },
      recentActivity: [],
    })

    expect(tiles).toHaveLength(9)
    expect(tiles.every((tile) => tile.value === 0)).toBe(true)
  })
})
