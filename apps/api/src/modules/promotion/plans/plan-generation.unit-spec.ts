import { describe, expect, it } from '@jest/globals'
import {
  buildPlanRequest,
  normaliseSteps,
  type PlanOutput,
  PlanOutputSchema,
  phaseFor,
  stepDate,
} from './plan-generation'

const release = {
  title: 'Afterglow',
  type: 'SINGLE',
  scheduledAt: new Date('2026-09-26T18:00:00Z'),
  trackTitles: ['Afterglow'],
  genres: ['indie'],
  territories: ['UA', 'PL'],
  artistName: 'Demo Artist',
  bio: 'Played 120 shows.',
}
const profile = {
  goal: 'BUZZ' as const,
  channels: ['INSTAGRAM', 'TELEGRAM'] as const,
  weeklyHours: 3,
  countries: ['UA'],
  audience: 'late-night listeners',
  voiceWords: ['calm', 'direct'],
  voiceExamples: ['Wrote this at 3 a.m.'],
}
const step = (over: Partial<PlanOutput['steps'][number]>): PlanOutput['steps'][number] => ({
  offsetDays: -7,
  kind: 'POST',
  channels: ['INSTAGRAM'],
  title: 'Share a hook',
  body: 'A 15-second hook.',
  ...over,
})

describe('plan dates', () => {
  it('derives the phase from the offset', () => {
    expect([phaseFor(-1), phaseFor(0), phaseFor(3)]).toEqual(['PRE', 'LAUNCH', 'POST'])
  })

  it('dates a step from the release date, so moving the release moves the step', () => {
    expect(stepDate(release.scheduledAt, -21).toISOString()).toBe('2026-09-05T18:00:00.000Z')
    expect(stepDate(new Date('2026-10-03T18:00:00Z'), -21).toISOString()).toBe(
      '2026-09-12T18:00:00.000Z',
    )
  })
})

describe('buildPlanRequest', () => {
  it('puts the release, the profile and the kept steps into the prompt', () => {
    const { prompt } = buildPlanRequest(release, { ...profile, channels: [...profile.channels] }, [
      { offsetDays: -21, kind: 'POST', title: 'Announce the date' },
    ])
    expect(prompt).toContain('"Afterglow" (single), out Sep 26, 2026')
    expect(prompt).toContain('Channels the artist uses: INSTAGRAM, TELEGRAM')
    expect(prompt).toContain('- day -21, POST: Announce the date')
  })

  it('lists every spelling of the release date as a fact', () => {
    const { facts } = buildPlanRequest(release, { ...profile, channels: [...profile.channels] }, [])
    expect(facts).toEqual(
      expect.arrayContaining(['2026-09-26', 'Sep 26, 2026', 'September 26', '26 September 2026']),
    )
  })
})

describe('PlanOutputSchema', () => {
  it('rejects a step outside the four-week window', () => {
    expect(
      PlanOutputSchema.safeParse({ steps: [step({}), step({}), step({ offsetDays: 40 })] }).success,
    ).toBe(false)
  })
})

describe('normaliseSteps', () => {
  it('orders by date, numbers positions and derives phases', () => {
    const rows = normaliseSteps(
      {
        steps: [
          step({ offsetDays: 3 }),
          step({ offsetDays: -7 }),
          step({ kind: 'ACTION', offsetDays: 0, channels: [] }),
        ],
      },
      ['INSTAGRAM'],
      5,
    )
    expect(rows.map((r) => [r.position, r.offsetDays, r.phase])).toEqual([
      [5, -7, 'PRE'],
      [6, 0, 'LAUNCH'],
      [7, 3, 'POST'],
    ])
  })

  it('keeps only the channels the artist uses and drops posts left without one', () => {
    const rows = normaliseSteps(
      {
        steps: [
          step({ channels: ['INSTAGRAM', 'TIKTOK'] }),
          step({ channels: ['TIKTOK'], title: 'TikTok only' }),
        ],
      },
      ['INSTAGRAM'],
      0,
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]?.channels).toEqual(['INSTAGRAM'])
  })

  it('keeps one follower message, on release day, and countdowns only before it', () => {
    const rows = normaliseSteps(
      {
        steps: [
          step({ kind: 'FOLLOWER_MESSAGE', offsetDays: 2, channels: [] }),
          step({ kind: 'FOLLOWER_MESSAGE', offsetDays: 0, channels: [] }),
          step({ kind: 'COUNTDOWN', offsetDays: 1, channels: [] }),
          step({ kind: 'COUNTDOWN', offsetDays: -14, channels: [] }),
        ],
      },
      ['INSTAGRAM'],
      0,
    )
    expect(rows.map((r) => [r.kind, r.offsetDays])).toEqual([
      ['COUNTDOWN', -14],
      ['FOLLOWER_MESSAGE', 0],
    ])
  })
})
