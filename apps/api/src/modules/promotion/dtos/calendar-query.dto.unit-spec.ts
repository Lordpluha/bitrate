import { describe, expect, it } from '@jest/globals'
import { CalendarQuerySchema } from './calendar-query.dto'

describe('CalendarQuerySchema', () => {
  it('fills a missing end with the default window', () => {
    const parsed = CalendarQuerySchema.parse({ from: '2026-11-01T00:00:00Z' })
    expect(parsed.to.toISOString()).toBe('2027-01-03T00:00:00.000Z')
  })

  it('starts a week back by default, so overdue steps stay visible', () => {
    const parsed = CalendarQuerySchema.parse({})
    const lookback = Date.now() - parsed.from.getTime()
    expect(Math.round(lookback / 86_400_000)).toBe(7)
  })

  it.each([
    [{ from: '2026-12-01', to: '2026-11-01' }],
    [{ from: '2026-01-01', to: '2026-12-31' }],
    [{ from: 'not a date' }],
  ])('refuses an empty, too long or unreadable window: %j', (query) => {
    expect(CalendarQuerySchema.safeParse(query).success).toBe(false)
  })
})
