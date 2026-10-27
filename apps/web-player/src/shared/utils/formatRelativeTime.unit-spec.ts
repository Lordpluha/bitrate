import { describe, expect, it } from 'vitest'
import { formatRelativeTime } from './formatRelativeTime'

const now = new Date('2026-10-14T12:00:00.000Z')
const ago = (ms: number) => new Date(now.getTime() - ms)

/** Intl separates units with no-break spaces; compare against plain ones. */
const plain = (value: string) => value.replace(/\s/g, ' ')

describe('formatRelativeTime', () => {
  it('says "now" for the last minute', () => {
    expect(formatRelativeTime({ date: ago(20_000), locale: 'en', now })).toBe(
      'now',
    )
  })

  it('uses the largest whole unit that fits', () => {
    expect(
      formatRelativeTime({ date: ago(5 * 60_000), locale: 'en', now }),
    ).toBe('5 min. ago')
    expect(
      formatRelativeTime({ date: ago(3 * 3_600_000), locale: 'en', now }),
    ).toBe('3 hr. ago')
    expect(
      formatRelativeTime({ date: ago(2 * 86_400_000), locale: 'en', now }),
    ).toBe('2 days ago')
  })

  it('speaks the app locale, not the browser one', () => {
    expect(formatRelativeTime({ date: ago(20_000), locale: 'uk', now })).toBe(
      'зараз',
    )
    expect(
      plain(formatRelativeTime({ date: ago(5 * 60_000), locale: 'uk', now })),
    ).toBe('5 хв тому')
    expect(formatRelativeTime({ date: ago(20_000), locale: 'pl', now })).toBe(
      'teraz',
    )
    expect(
      plain(
        formatRelativeTime({ date: ago(3 * 3_600_000), locale: 'pl', now }),
      ),
    ).toBe('3 godz. temu')
  })
})
