import { describe, expect, it } from 'vitest'
import { getActivityAction } from './activityAction'

const now = new Date('2026-10-19T12:00:00.000Z')

describe('getActivityAction', () => {
  it('says a play from the last few minutes is still going', () => {
    expect(
      getActivityAction({
        listenedAt: new Date('2026-10-19T11:57:00.000Z'),
        now,
      }),
    ).toBe('is listening to')
  })

  it('says an older play was played', () => {
    expect(
      getActivityAction({
        listenedAt: new Date('2026-10-19T11:30:00.000Z'),
        now,
      }),
    ).toBe('played')
  })
})
