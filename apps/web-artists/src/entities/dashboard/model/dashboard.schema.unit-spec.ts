import { describe, expect, it } from 'vitest'
import { artistDashboardSchema } from './dashboard.schema'

const dashboard = (cover: string | null) => ({
  counts: { releases: 1, drafts: 0, inReview: 0, released: 0, tracks: 1 },
  currentRelease: null,
  attention: [],
  upcoming: [
    {
      id: '019a0000-0000-7000-8000-000000000201',
      title: 'Release',
      status: 'READY',
      cover,
      scheduledAt: '2026-11-06T19:03:00.000Z',
    },
  ],
})

describe('artistDashboardSchema', () => {
  it('keeps the cover of an upcoming release', () => {
    const parsed = artistDashboardSchema.parse(
      dashboard('/static/covers/release.webp'),
    )
    expect(parsed.upcoming[0]?.cover).toBe('/static/covers/release.webp')
  })

  it('accepts an upcoming release without a cover', () => {
    const parsed = artistDashboardSchema.parse(dashboard(null))
    expect(parsed.upcoming[0]?.cover).toBeNull()
  })
})
