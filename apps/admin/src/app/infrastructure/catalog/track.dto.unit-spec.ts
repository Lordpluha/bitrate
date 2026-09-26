import { describe, expect, it } from 'vitest'
import { trackDetailDto, trackPageDto } from './track.dto'

/**
 * The schema this app got wrong: it required `artistName` while the API had always sent
 * `artistUsername`, so `parse` threw on every catalog load. The types are now bound to the
 * generated contract, which stops that class of rename at compile time — these cases pin the
 * runtime half, against a payload shaped the way the API actually answers.
 */
const apiRow = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  title: 'Night Drive',
  artistUsername: 'dj-test',
  cover: null,
  processingStatus: 'READY',
  processingError: null,
  processingAttempts: 0,
  processingStartedAt: '2026-09-01T10:00:00.000Z',
  processingFinishedAt: '2026-09-01T10:02:00.000Z',
  deletedAt: null,
  updatedAt: '2026-09-01T10:02:00.000Z',
  createdAt: '2026-09-01T09:59:00.000Z',
}

const apiPage = { data: [apiRow], total: 1, page: 1, limit: 20 }

describe('trackPageDto', () => {
  it('accepts the page the API actually returns', () => {
    const parsed = trackPageDto.parse(apiPage)

    expect(parsed.data[0]?.artistUsername).toBe('dj-test')
    expect(parsed.total).toBe(1)
  })

  it('keeps a failed track with its error message and no finish time', () => {
    const failed = {
      ...apiRow,
      processingStatus: 'FAILED',
      processingError: 'ffmpeg exited with 1',
      processingFinishedAt: null,
    }

    const parsed = trackPageDto.parse({ ...apiPage, data: [failed] })

    expect(parsed.data[0]?.processingError).toBe('ffmpeg exited with 1')
  })

  it('rejects the old artistName shape rather than rendering a blank column', () => {
    const { artistUsername, ...withoutUsername } = apiRow
    const stale = { ...withoutUsername, artistName: artistUsername }

    expect(() => trackPageDto.parse({ ...apiPage, data: [stale] })).toThrow()
  })

  it('rejects a processing status it does not handle', () => {
    const unknown = { ...apiRow, processingStatus: 'QUEUED' }

    expect(() => trackPageDto.parse({ ...apiPage, data: [unknown] })).toThrow()
  })

  it('rejects a non-numeric attempt count', () => {
    const wrong = { ...apiRow, processingAttempts: '0' }

    expect(() => trackPageDto.parse({ ...apiPage, data: [wrong] })).toThrow()
  })

  it('keeps a taken-down track with its deletedAt timestamp', () => {
    const takenDown = { ...apiRow, deletedAt: '2026-09-10T08:00:00.000Z' }

    const parsed = trackPageDto.parse({ ...apiPage, data: [takenDown] })

    expect(parsed.data[0]?.deletedAt).toBe('2026-09-10T08:00:00.000Z')
  })

  it("keeps a stored cover filename as-is — the URL join is the mapper's job", () => {
    const withCover = { ...apiRow, cover: 'abc123.png' }

    const parsed = trackPageDto.parse({ ...apiPage, data: [withCover] })

    expect(parsed.data[0]?.cover).toBe('abc123.png')
  })
})

const detailRow = {
  ...apiRow,
  artistId: '3f2504e0-4f89-41d3-9a0c-0305e82c3305',
  audioFiles: [
    {
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3306',
      format: 'opus',
      bitrate: 192,
      codec: 'opus',
      size: 5_242_880,
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
  genres: [{ id: '3f2504e0-4f89-41d3-9a0c-0305e82c3307', name: 'House', slug: 'house' }],
  albums: [],
  openReportCount: 0,
}

describe('trackDetailDto', () => {
  it('accepts the detail shape the API actually returns', () => {
    const parsed = trackDetailDto.parse(detailRow)

    expect(parsed.audioFiles[0]?.format).toBe('opus')
    expect(parsed.artists[0]?.isPrimary).toBe(true)
  })

  it('rejects a processing status it does not handle', () => {
    expect(() => trackDetailDto.parse({ ...detailRow, processingStatus: 'QUEUED' })).toThrow()
  })

  it('rejects a rendition missing its bitrate', () => {
    const { bitrate: _bitrate, ...withoutBitrate } = detailRow.audioFiles[0] ?? {}

    expect(() => trackDetailDto.parse({ ...detailRow, audioFiles: [withoutBitrate] })).toThrow()
  })
})
