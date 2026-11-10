import { describe, expect, it } from 'vitest'
import { formatStat, parsePlatformStats } from './platformStats'

describe('parsePlatformStats', () => {
  it('accepts the API totals', () => {
    expect(
      parsePlatformStats({ artists: 12, listeners: 340, tracks: 5600 }),
    ).toEqual({ artists: 12, listeners: 340, tracks: 5600 })
  })

  it('drops anything that is not three whole, non-negative counts', () => {
    expect(parsePlatformStats({ artists: 12, listeners: 340 })).toBeNull()
    expect(
      parsePlatformStats({ artists: -1, listeners: 340, tracks: 1 }),
    ).toBeNull()
    expect(
      parsePlatformStats({ artists: '12', listeners: 340, tracks: 1 }),
    ).toBeNull()
    expect(parsePlatformStats(null)).toBeNull()
  })
})

describe('formatStat', () => {
  it('writes small counts in full and large ones compactly, in the landing language', () => {
    expect(formatStat({ value: 940, locale: 'en' })).toBe('940')
    expect(formatStat({ value: 12_400, locale: 'en' })).toBe('12.4K')
    expect(formatStat({ value: 12_400, locale: 'uk' })).toBe('12,4\u00a0тис.')
  })
})
