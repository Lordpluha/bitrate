import { describe, expect, it } from 'vitest'
import { countdownParts } from './countdown'

describe('countdownParts', () => {
  it('splits the time left into days, hours, minutes and seconds', () => {
    const now = Date.parse('2026-11-03T10:00:00Z')
    const target = now + ((2 * 24 + 5) * 3600 + 7 * 60 + 9) * 1000
    expect(countdownParts(target, now)).toEqual({
      days: 2,
      hours: 5,
      minutes: 7,
      seconds: 9,
    })
  })

  it('stops at zero once the moment has passed', () => {
    expect(countdownParts(1000, 5000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    })
  })

  it('ignores a partial second', () => {
    expect(countdownParts(1999, 0).seconds).toBe(1)
  })
})
