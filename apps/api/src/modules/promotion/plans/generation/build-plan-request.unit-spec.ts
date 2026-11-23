import { describe, expect, it } from '@jest/globals'
import { buildPlanRequest } from './build-plan-request'

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
  channels: ['INSTAGRAM' as const, 'TELEGRAM' as const],
  weeklyHours: 3,
  countries: ['UA'],
  audience: 'late-night listeners',
  voiceWords: ['calm', 'direct'],
  voiceExamples: ['Wrote this at 3 a.m.'],
}

describe('buildPlanRequest', () => {
  it('puts the release, the profile and the kept steps into the prompt', () => {
    const { prompt } = buildPlanRequest(release, profile, [
      { offsetDays: -21, kind: 'POST', title: 'Announce the date' },
    ])
    expect(prompt).toContain('"Afterglow" (single), out Sep 26, 2026')
    expect(prompt).toContain('Channels the artist uses: INSTAGRAM, TELEGRAM')
    expect(prompt).toContain('Main audience: UA · late-night listeners')
    expect(prompt).toContain('- day -21, POST: Announce the date')
  })

  it('makes the prompt, the bio and every spelling of the date grounding facts', () => {
    const { facts } = buildPlanRequest(release, profile, [])
    expect(facts).toEqual(
      expect.arrayContaining([
        'Artist bio: Played 120 shows.',
        '2026-09-26',
        'Sep 26, 2026',
        'September 26',
        '26 September 2026',
        '2026',
      ]),
    )
  })
})
