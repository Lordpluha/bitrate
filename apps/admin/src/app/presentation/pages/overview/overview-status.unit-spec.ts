import type { Overview } from '@domain/overview'
import { ROUTE_PERMISSIONS } from '@presentation/guards'
import { describe, expect, it } from 'vitest'
import {
  buildAccountDeactivationStatus,
  buildReportsStatus,
  buildTrackPipelineStatus,
} from './overview-status'

const OVERVIEW: Overview = {
  reports: { open: 3, reviewing: 1 },
  tracks: { processing: 2, ready: 50, failed: 4, stuck: 1, stuckAfterMs: 1_800_000 },
  deactivated: { users: 2, artists: 0 },
  last7Days: { signups: 5, uploads: 12 },
  recentActivity: [],
}

describe('buildTrackPipelineStatus', () => {
  it('links failed and processing to the catalog list, filtered by status', () => {
    const items = buildTrackPipelineStatus(OVERVIEW)

    expect(items.find((item) => item.id === 'tracks-failed')?.link).toEqual({
      path: '/catalog',
      permission: 'tracks:read',
      queryParams: { status: 'FAILED' },
    })
    expect(items.find((item) => item.id === 'tracks-processing')?.link).toEqual({
      path: '/catalog',
      permission: 'tracks:read',
      queryParams: { status: 'PROCESSING' },
    })
  })

  it('leaves the stuck item without a link — catalog has no "stuck" status', () => {
    const items = buildTrackPipelineStatus(OVERVIEW)

    expect(items.find((item) => item.id === 'tracks-stuck')?.link).toBeUndefined()
  })

  it('renders the stuck hint in whole minutes from stuckAfterMs', () => {
    const items = buildTrackPipelineStatus(OVERVIEW)

    expect(items.find((item) => item.id === 'tracks-stuck')?.hint).toBe(
      'Past 30 min in processing',
    )
  })

  it('renders every count, including zero, against an empty database', () => {
    const items = buildTrackPipelineStatus({
      ...OVERVIEW,
      tracks: { processing: 0, ready: 0, failed: 0, stuck: 0, stuckAfterMs: 1_800_000 },
    })

    expect(items).toHaveLength(3)
    expect(items.every((item) => item.value === 0)).toBe(true)
  })
})

describe('buildReportsStatus', () => {
  it('links each item to the matching filtered moderation view', () => {
    const items = buildReportsStatus(OVERVIEW)

    /**
     * `OPEN` is the moderation queue's own codec default, so a canonical link to it carries no
     * query params — encoding it explicitly would round-trip to the same URL, but the codec
     * never emits it.
     */
    expect(items.find((item) => item.id === 'reports-open')?.link).toEqual({
      path: '/moderation',
      permission: 'reports:read',
    })
    expect(items.find((item) => item.id === 'reports-reviewing')?.link).toEqual({
      path: '/moderation',
      permission: 'reports:read',
      queryParams: { status: 'REVIEWING' },
    })
  })
})

describe('buildAccountDeactivationStatus', () => {
  it('links each item to the matching filtered account list', () => {
    const items = buildAccountDeactivationStatus(OVERVIEW)

    expect(items.find((item) => item.id === 'deactivated-users')?.link).toEqual({
      path: '/users',
      permission: 'users:read',
      queryParams: { status: 'deactivated' },
    })
    expect(items.find((item) => item.id === 'deactivated-artists')?.link).toEqual({
      path: '/artists',
      permission: 'artists:read',
      queryParams: { status: 'deactivated' },
    })
  })

  it("binds every linked item's permission to its target route's own guard", () => {
    const groups = [
      buildTrackPipelineStatus(OVERVIEW),
      buildReportsStatus(OVERVIEW),
      buildAccountDeactivationStatus(OVERVIEW),
    ]

    for (const items of groups) {
      for (const item of items) {
        if (!item.link) continue
        const route = ROUTE_PERMISSIONS.find((candidate) => candidate.path === item.link?.path)
        expect(item.link.permission).toBe(route?.permission)
      }
    }
  })
})
