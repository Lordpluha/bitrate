import { describe, expect, it } from 'vitest'
import { listeningHistoryEntryDto, listeningHistoryPageDto } from './listening-history.dto'
import { toListeningHistoryEntry } from './listening-history.mapper'

const RAW_ENTRY = {
  id: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3301',
  listenedAt: '2026-09-17T12:00:00.000Z',
  trackId: 'a1b2c3d4-4f89-41d3-9a0c-0305e82c3302',
  trackTitle: 'Test Track',
  artistUsername: 'dj-test',
}

describe('listeningHistoryEntryDto + toListeningHistoryEntry', () => {
  it('parses a realistic entry and maps it into the domain shape', () => {
    const dto = listeningHistoryEntryDto.parse(RAW_ENTRY)

    expect(toListeningHistoryEntry(dto)).toEqual({
      id: RAW_ENTRY.id,
      listenedAt: new Date(RAW_ENTRY.listenedAt),
      trackId: RAW_ENTRY.trackId,
      trackTitle: RAW_ENTRY.trackTitle,
      artistUsername: RAW_ENTRY.artistUsername,
    })
  })

  it('throws on a payload missing a required field', () => {
    const { trackTitle: _trackTitle, ...withoutTitle } = RAW_ENTRY

    expect(() => listeningHistoryEntryDto.parse(withoutTitle)).toThrow()
  })

  it('throws when listenedAt is not a valid ISO datetime', () => {
    const malformed = { ...RAW_ENTRY, listenedAt: 'not-a-date' }

    expect(() => listeningHistoryEntryDto.parse(malformed)).toThrow()
  })
})

describe('listeningHistoryPageDto', () => {
  it('parses an empty history page', () => {
    const page = listeningHistoryPageDto.parse({ data: [], total: 0, page: 1, limit: 10 })

    expect(page.data).toEqual([])
  })
})
