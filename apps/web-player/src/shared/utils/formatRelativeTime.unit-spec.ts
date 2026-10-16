import { describe, expect, it } from 'vitest'
import { formatRelativeTime } from './formatRelativeTime'

const now = new Date('2026-10-14T12:00:00.000Z')
const ago = (ms: number) => new Date(now.getTime() - ms)

describe('formatRelativeTime', () => {
  it('says "now" for the last minute', () => {
    expect(formatRelativeTime({ date: ago(20_000), now })).toBe('now')
  })

  it('uses the largest whole unit that fits', () => {
    expect(formatRelativeTime({ date: ago(5 * 60_000), now })).toBe(
      '5 min. ago',
    )
    expect(formatRelativeTime({ date: ago(3 * 3_600_000), now })).toBe(
      '3 hr. ago',
    )
    expect(formatRelativeTime({ date: ago(2 * 86_400_000), now })).toBe(
      '2 days ago',
    )
  })
})
