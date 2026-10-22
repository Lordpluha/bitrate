import { describe, expect, it } from 'vitest'
import { formatElapsed } from './elapsed.pipe'

const NOW = new Date('2026-10-22T12:00:00.000Z')
const ago = (ms: number) => new Date(NOW.getTime() - ms)
const MINUTE = 60_000
const HOUR = 60 * MINUTE

describe('formatElapsed', () => {
  it('counts minutes under an hour, never less than one', () => {
    expect(formatElapsed(ago(12 * MINUTE), NOW, 'en')).toBe('12 min')
    expect(formatElapsed(ago(5_000), NOW, 'en')).toBe('1 min')
  })

  it('counts whole hours under two days', () => {
    expect(formatElapsed(ago(6 * HOUR + 40 * MINUTE), NOW, 'en')).toBe('6 hr')
    expect(formatElapsed(ago(47 * HOUR), NOW, 'en')).toBe('47 hr')
  })

  it('counts days from two days on', () => {
    expect(formatElapsed(ago(50 * HOUR), NOW, 'en')).toBe('2 days')
  })

  it('speaks the operator’s language', () => {
    expect(formatElapsed(ago(6 * HOUR), NOW, 'uk')).toBe(
      new Intl.NumberFormat('uk', { style: 'unit', unit: 'hour', unitDisplay: 'short' }).format(6),
    )
  })

  it('treats a date in the future (clock skew) as just now', () => {
    expect(formatElapsed(new Date(NOW.getTime() + HOUR), NOW, 'en')).toBe('1 min')
  })
})
