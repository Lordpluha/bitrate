import { describe, expect, it } from 'vitest'
import {
  profileFormDefaults,
  profileFormSchema,
  toProfileInput,
} from './profileForm'

const valid = {
  goal: 'BUZZ' as const,
  channels: ['INSTAGRAM' as const],
  weeklyHours: 3,
  countries: 'ua, pl',
  audience: 'Late-night listeners',
  voiceWords: 'calm, direct, warm',
  examples: ['Wrote this one at 3 a.m.', '', ''],
}

const issues = (values: object) => {
  const result = profileFormSchema.safeParse(values)
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe('promotion profile form', () => {
  it('turns the entries into the API body', () => {
    expect(toProfileInput(profileFormSchema.parse(valid))).toEqual({
      goal: 'BUZZ',
      channels: ['INSTAGRAM'],
      weeklyHours: 3,
      countries: ['UA', 'PL'],
      audience: 'Late-night listeners',
      voiceWords: ['calm', 'direct', 'warm'],
      voiceExamples: ['Wrote this one at 3 a.m.'],
    })
  })

  it('needs at least one channel and whole hours from 1 to 40', () => {
    expect(issues({ ...valid, channels: [], weeklyHours: 0 })).toEqual([
      'promotion.profile.channelsError',
      'promotion.profile.weeklyError',
    ])
  })

  it('refuses country names, more than three voice words and contact details', () => {
    expect(
      issues({
        ...valid,
        countries: 'Ukraine',
        voiceWords: 'a, b, c, d',
        examples: ['Listen at bitrate.fm/afterglow', '', ''],
      }),
    ).toEqual([
      'promotion.profile.countriesError',
      'promotion.profile.voiceWordsError',
      'validation.promotion.contact_details',
    ])
  })

  it('fills an empty form for an artist without a profile', () => {
    expect(profileFormDefaults(null)).toMatchObject({
      channels: [],
      weeklyHours: 2,
      examples: ['', '', ''],
    })
  })
})
