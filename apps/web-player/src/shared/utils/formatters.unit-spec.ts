import { describe, expect, it } from 'vitest'
import { formatDate } from './formatDate'
import { formatNumber } from './formatNumber'

/** Intl groups digits and dates with no-break spaces; compare against plain ones. */
const plain = (value: string) => value.replace(/\s/g, ' ')

const date = new Date('2026-10-14T12:00:00.000Z')

describe('formatNumber', () => {
  it('groups digits the way the app locale does', () => {
    expect(formatNumber({ locale: 'en', value: 12_345 })).toBe('12,345')
    expect(plain(formatNumber({ locale: 'uk', value: 12_345 }))).toBe('12 345')
    expect(plain(formatNumber({ locale: 'pl', value: 12_345 }))).toBe('12 345')
  })
})

describe('formatDate', () => {
  it('defaults to a short month, day and year in the app locale', () => {
    expect(formatDate({ date, locale: 'en' })).toBe('Oct 14, 2026')
    expect(plain(formatDate({ date, locale: 'uk' }))).toBe('14 жовт. 2026 р.')
    expect(plain(formatDate({ date, locale: 'pl' }))).toBe('14 paź 2026')
  })

  it('accepts the caller’s format options and ISO strings', () => {
    expect(
      formatDate({
        date: date.toISOString(),
        locale: 'en',
        options: { day: 'numeric', month: 'long', timeZone: 'UTC' },
      }),
    ).toBe('October 14')
  })
})
