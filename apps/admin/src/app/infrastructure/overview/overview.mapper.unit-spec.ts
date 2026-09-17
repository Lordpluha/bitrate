import { describe, expect, it } from 'vitest'
import { overviewDto } from './overview.dto'
import { toOverview } from './overview.mapper'

const RAW = {
  reports: { open: 3, reviewing: 2 },
  tracks: { processing: 4, ready: 50, failed: 1, stuck: 2, stuckAfterMs: 1_800_000 },
  deactivated: { users: 7, artists: 1 },
  last7Days: { signups: 8, uploads: 5 },
  recentActivity: [
    {
      id: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3301',
      action: 'admin-tracks.reprocess',
      entityType: 'admin-tracks',
      entityId: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3302',
      actorUsername: 'fixture-moderator',
      ipAddress: '127.0.0.1',
      createdAt: '2026-09-17T12:00:00.000Z',
    },
  ],
}

describe('overviewDto + toOverview', () => {
  it('parses a realistic AdminOverviewEntity payload into the domain shape', () => {
    const dto = overviewDto.parse(RAW)

    expect(toOverview(dto)).toEqual({
      reports: { open: 3, reviewing: 2 },
      tracks: { processing: 4, ready: 50, failed: 1, stuck: 2, stuckAfterMs: 1_800_000 },
      deactivated: { users: 7, artists: 1 },
      last7Days: { signups: 8, uploads: 5 },
      recentActivity: [
        {
          id: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3301',
          action: 'admin-tracks.reprocess',
          entityType: 'admin-tracks',
          entityId: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3302',
          actorUsername: 'fixture-moderator',
          ipAddress: '127.0.0.1',
          createdAt: new Date('2026-09-17T12:00:00.000Z'),
        },
      ],
    })
  })

  it('maps an empty recent-activity list to an empty domain list', () => {
    const dto = overviewDto.parse({ ...RAW, recentActivity: [] })

    expect(toOverview(dto).recentActivity).toEqual([])
  })

  it('throws on a payload missing a required aggregate field', () => {
    const { tracks: _tracks, ...withoutTracks } = RAW

    expect(() => overviewDto.parse(withoutTracks)).toThrow()
  })

  it('throws when a count field arrives as a non-numeric string', () => {
    const malformed = { ...RAW, reports: { open: '3', reviewing: 2 } }

    expect(() => overviewDto.parse(malformed)).toThrow()
  })
})
