import { describe, expect, it } from 'vitest'
import { comingUp } from './comingUp'

const planned = (index: number, scheduledAt: string) => ({
  id: `019a0000-0000-7000-8000-00000000020${index}`,
  title: `Release ${index}`,
  status: 'READY' as const,
  scheduledAt,
})

describe('comingUp', () => {
  it('lists planned release dates, soonest first', () => {
    const items = comingUp([
      planned(1, '2026-11-01T12:00:00.000Z'),
      planned(2, '2026-10-25T09:00:00.000Z'),
    ])
    expect(items).toEqual([
      {
        key: 'release-019a0000-0000-7000-8000-000000000202',
        at: '2026-10-25T09:00:00.000Z',
        title: 'dashboard.upcoming.plannedDate',
        detail: 'Release 2',
        releaseId: '019a0000-0000-7000-8000-000000000202',
      },
      {
        key: 'release-019a0000-0000-7000-8000-000000000201',
        at: '2026-11-01T12:00:00.000Z',
        title: 'dashboard.upcoming.plannedDate',
        detail: 'Release 1',
        releaseId: '019a0000-0000-7000-8000-000000000201',
      },
    ])
  })

  it('keeps at most four dates', () => {
    const upcoming = Array.from({ length: 5 }, (_, index) =>
      planned(index, `2026-11-0${index + 1}T09:00:00.000Z`),
    )
    expect(comingUp(upcoming)).toHaveLength(4)
  })
})
