import { describe, expect, it } from 'vitest'
import { adminTrackPageSchema } from './track.schema'

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
  processingStatus: 'READY',
  processingError: null,
  processingAttempts: 0,
  processingStartedAt: '2026-09-01T10:00:00.000Z',
  processingFinishedAt: '2026-09-01T10:02:00.000Z',
  createdAt: '2026-09-01T09:59:00.000Z',
}

const apiPage = { data: [apiRow], total: 1, page: 1, limit: 20 }

describe('adminTrackPageSchema', () => {
  it('accepts the page the API actually returns', () => {
    const parsed = adminTrackPageSchema.parse(apiPage)

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

    const parsed = adminTrackPageSchema.parse({ ...apiPage, data: [failed] })

    expect(parsed.data[0]?.processingError).toBe('ffmpeg exited with 1')
  })

  it('rejects the old artistName shape rather than rendering a blank column', () => {
    const { artistUsername, ...withoutUsername } = apiRow
    const stale = { ...withoutUsername, artistName: artistUsername }

    expect(() => adminTrackPageSchema.parse({ ...apiPage, data: [stale] })).toThrow()
  })

  it('rejects a processing status it does not handle', () => {
    const unknown = { ...apiRow, processingStatus: 'QUEUED' }

    expect(() => adminTrackPageSchema.parse({ ...apiPage, data: [unknown] })).toThrow()
  })

  it('rejects a non-numeric attempt count', () => {
    const wrong = { ...apiRow, processingAttempts: '0' }

    expect(() => adminTrackPageSchema.parse({ ...apiPage, data: [wrong] })).toThrow()
  })
})
