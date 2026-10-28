import { createI18n } from '@shared/i18n'
import { describe, expect, it } from 'vitest'
import { getActivityAction } from './activityAction'

const now = new Date('2026-10-19T12:00:00.000Z')
const { t } = createI18n({ locale: 'en' })

describe('getActivityAction', () => {
  it('says a play from the last few minutes is still going', () => {
    expect(
      getActivityAction({
        listenedAt: new Date('2026-10-19T11:57:00.000Z'),
        now,
        t,
      }),
    ).toBe('is listening to')
  })

  it('says an older play was played', () => {
    expect(
      getActivityAction({
        listenedAt: new Date('2026-10-19T11:30:00.000Z'),
        now,
        t,
      }),
    ).toBe('played')
  })

  it('speaks the app locale', () => {
    expect(
      getActivityAction({
        listenedAt: new Date('2026-10-19T11:57:00.000Z'),
        now,
        t: createI18n({ locale: 'uk' }).t,
      }),
    ).toBe('слухає')
  })
})
