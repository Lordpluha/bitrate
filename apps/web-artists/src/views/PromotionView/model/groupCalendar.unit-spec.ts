import type { CalendarEntry } from '@entities/promotion'
import { describe, expect, it } from 'vitest'
import { activePlans, groupCalendar } from './groupCalendar'

const entry = (
  stepId: string,
  dueAt: string,
  releaseId = 'r1',
): CalendarEntry => ({
  stepId,
  releaseId,
  releaseTitle: releaseId === 'r1' ? 'Afterglow' : 'Night Signal',
  cover: null,
  dueAt,
  offsetDays: 0,
  phase: 'PRE',
  kind: 'POST',
  channels: [],
  title: stepId,
  state: 'SUGGESTED',
  aiGenerated: true,
})

describe('groupCalendar', () => {
  const now = new Date('2026-11-24T15:00:00Z')

  it('splits steps into earlier, this week and later from the start of today', () => {
    const groups = groupCalendar(
      [
        entry('past', '2026-11-23T18:00:00Z'),
        entry('today', '2026-11-24T08:00:00Z'),
        entry('sunday', '2026-11-30T23:00:00Z'),
        entry('next', '2026-12-01T00:00:00Z'),
      ],
      now,
    )
    expect(groups.earlier.map((e) => e.stepId)).toEqual(['past'])
    expect(groups.thisWeek.map((e) => e.stepId)).toEqual(['today', 'sunday'])
    expect(groups.later.map((e) => e.stepId)).toEqual(['next'])
  })

  it('counts each release plan once', () => {
    const plans = activePlans([
      entry('a', '2026-11-25T00:00:00Z'),
      entry('b', '2026-11-26T00:00:00Z', 'r2'),
      entry('c', '2026-11-27T00:00:00Z'),
    ])
    expect(plans).toEqual([
      { releaseId: 'r1', title: 'Afterglow', steps: 2 },
      { releaseId: 'r2', title: 'Night Signal', steps: 1 },
    ])
  })
})
