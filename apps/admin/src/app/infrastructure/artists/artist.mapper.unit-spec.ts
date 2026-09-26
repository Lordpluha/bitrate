import { describe, expect, it } from 'vitest'
import type { ArtistDetailDto, ArtistDto } from './artist.dto'
import { toArtist, toArtistDetail, toWireArtistStatus } from './artist.mapper'

const dto: ArtistDto = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  username: 'dj-test',
  email: 'dj@example.com',
  verified: true,
  monthlyListeners: 1200,
  country: 'UA',
  createdAt: '2026-09-01T09:59:00.000Z',
  deletedAt: null,
}

describe('toArtist', () => {
  it('turns the API timestamps into Dates the domain can compare', () => {
    const artist = toArtist(dto)

    expect(artist.createdAt).toBeInstanceOf(Date)
    expect(artist.createdAt.toISOString()).toBe('2026-09-01T09:59:00.000Z')
  })

  it("renames the API's deletedAt to what the panel actually does", () => {
    const artist = toArtist({ ...dto, deletedAt: '2026-09-10T08:00:00.000Z' })

    expect(artist.deactivatedAt?.toISOString()).toBe('2026-09-10T08:00:00.000Z')
    expect(artist).not.toHaveProperty('deletedAt')
  })

  it('keeps a null deactivation as null rather than an epoch Date', () => {
    expect(toArtist(dto).deactivatedAt).toBeNull()
  })
})

describe('toArtistDetail', () => {
  const detailDto: ArtistDetailDto = {
    ...dto,
    counts: { tracks: 4, albums: 1, activeSessions: 2, openReports: 0 },
  }

  it('carries the counts through alongside the base fields', () => {
    expect(toArtistDetail(detailDto)).toMatchObject({
      username: 'dj-test',
      counts: { tracks: 4, albums: 1, activeSessions: 2, openReports: 0 },
    })
  })
})

describe('toWireArtistStatus', () => {
  it('is a direct pass-through, stated explicitly so a dropped member fails to compile', () => {
    expect(toWireArtistStatus('active')).toBe('active')
    expect(toWireArtistStatus('deactivated')).toBe('deactivated')
    expect(toWireArtistStatus('all')).toBe('all')
  })
})
