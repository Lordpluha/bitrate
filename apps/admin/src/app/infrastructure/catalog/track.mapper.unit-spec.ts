import { describe, expect, it } from 'vitest'
import type { TrackDetailDto, TrackDto } from './track.dto'
import { toTrack, toTrackDetail, toWireTrackStatus } from './track.mapper'

const dto: TrackDto = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  title: 'Night Drive',
  artistUsername: 'dj-test',
  processingStatus: 'READY',
  processingError: null,
  processingAttempts: 0,
  processingStartedAt: null,
  processingFinishedAt: '2026-09-01T10:02:00.000Z',
  deletedAt: null,
  updatedAt: '2026-09-01T10:02:00.000Z',
  createdAt: '2026-09-01T09:59:00.000Z',
}

describe('toTrack', () => {
  it("renames the API's deletedAt to what the panel actually does", () => {
    const track = toTrack({ ...dto, deletedAt: '2026-09-10T08:00:00.000Z' })

    expect(track.takenDownAt?.toISOString()).toBe('2026-09-10T08:00:00.000Z')
    expect(track).not.toHaveProperty('deletedAt')
  })

  it('keeps a null take-down as null', () => {
    expect(toTrack(dto).takenDownAt).toBeNull()
  })

  it('carries updatedAt through as a Date', () => {
    expect(toTrack(dto).updatedAt).toBeInstanceOf(Date)
  })
})

describe('toWireTrackStatus', () => {
  it('is a direct pass-through, stated explicitly so a dropped member fails to compile', () => {
    expect(toWireTrackStatus('active')).toBe('active')
    expect(toWireTrackStatus('deactivated')).toBe('deactivated')
    expect(toWireTrackStatus('all')).toBe('all')
  })
})

describe('toTrackDetail', () => {
  const detailDto: TrackDetailDto = {
    ...dto,
    artistId: '3f2504e0-4f89-41d3-9a0c-0305e82c3305',
    audioFiles: [
      {
        id: '3f2504e0-4f89-41d3-9a0c-0305e82c3306',
        format: 'opus',
        bitrate: 192,
        codec: 'opus',
        size: 100,
      },
    ],
    artists: [
      {
        artistId: '3f2504e0-4f89-41d3-9a0c-0305e82c3305',
        username: 'dj-test',
        isPrimary: true,
        position: 0,
      },
    ],
    genres: [],
    albums: [],
    openReportCount: 2,
  }

  it('carries the detail fields through alongside the base fields', () => {
    expect(toTrackDetail(detailDto)).toMatchObject({
      title: 'Night Drive',
      artistId: '3f2504e0-4f89-41d3-9a0c-0305e82c3305',
      openReportCount: 2,
    })
  })
})
