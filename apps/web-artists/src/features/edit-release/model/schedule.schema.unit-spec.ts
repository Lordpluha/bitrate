import { describe, expect, it } from 'vitest'
import {
  scheduleDefaults,
  scheduleInstant,
  scheduleSchema,
} from './schedule.schema'

describe('schedule form', () => {
  it('offers a stored premiere as a date and an hours:minutes time', () => {
    expect(scheduleDefaults('2026-11-06T19:03:22.100Z')).toEqual({
      planned: true,
      date: '2026-11-06',
      time: '19:03',
    })
  })

  it('starts a new premiere at midnight UTC', () => {
    expect(scheduleDefaults(null)).toEqual({
      planned: false,
      date: '',
      time: '00:00',
    })
  })

  it('saves hours and minutes as a whole-minute UTC instant', () => {
    expect(
      scheduleInstant({ planned: true, date: '2026-11-05', time: '19:03' }),
    ).toBe('2026-11-05T19:03:00.000Z')
  })

  it('accepts hours and minutes alone', () => {
    expect(
      scheduleSchema.safeParse({
        planned: true,
        date: '2026-11-05',
        time: '19:03',
      }).success,
    ).toBe(true)
  })
})
