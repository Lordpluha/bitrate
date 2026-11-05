import { describe, expect, it } from 'vitest'
import { comingUp, nextPremieres } from './comingUp'

const planned = (index: number, scheduledAt: string) => ({
  id: `019a0000-0000-7000-8000-00000000020${index}`,
  title: `Release ${index}`,
  status: 'READY' as const,
  cover: `/static/covers/${index}.webp`,
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
        title: 'Release 2',
        status: 'READY',
        cover: '/static/covers/2.webp',
        releaseId: '019a0000-0000-7000-8000-000000000202',
      },
      {
        key: 'release-019a0000-0000-7000-8000-000000000201',
        at: '2026-11-01T12:00:00.000Z',
        title: 'Release 1',
        status: 'READY',
        cover: '/static/covers/1.webp',
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

describe('nextPremieres', () => {
  const now = Date.parse('2026-11-04T12:00:00.000Z')

  it('picks the soonest date that is still ahead', () => {
    const items = comingUp([
      planned(1, '2026-11-04T11:59:00.000Z'),
      planned(2, '2026-11-06T09:00:00.000Z'),
      planned(3, '2026-11-08T09:00:00.000Z'),
    ])
    expect(nextPremieres(items, now).map((item) => item.title)).toEqual([
      'Release 2',
    ])
  })

  it('keeps every release that premieres at that same moment', () => {
    const items = comingUp([
      planned(1, '2026-11-06T09:00:00.000Z'),
      planned(2, '2026-11-06T09:00:00.000Z'),
      planned(3, '2026-11-06T10:00:00.000Z'),
    ])
    expect(nextPremieres(items, now).map((item) => item.title)).toEqual([
      'Release 1',
      'Release 2',
    ])
  })

  it('finds nothing once every date has passed', () => {
    const items = comingUp([planned(1, '2026-11-04T11:00:00.000Z')])
    expect(nextPremieres(items, now)).toEqual([])
  })
})
