import { describe, expect, it } from '@jest/globals'
import { PROMOTION_VALIDATION } from '../promotion.errors'
import { PromotionProfileSchema, UpdatePromotionStepSchema } from './promotion.dto'

const profile = {
  goal: 'BUZZ',
  channels: ['INSTAGRAM', 'TELEGRAM'],
  weeklyHours: 3,
  countries: ['UA', 'PL'],
  audience: 'Late-night listeners',
  voiceWords: ['calm', 'direct'],
  voiceExamples: ['Wrote this one at 3 a.m.'],
}
const issues = (input: unknown) =>
  PromotionProfileSchema.safeParse(input).error?.issues.map((i) => i.message) ?? []

describe('PromotionProfileSchema', () => {
  it('accepts a complete profile', () => {
    expect(PromotionProfileSchema.safeParse(profile).success).toBe(true)
  })

  it('refuses contact details in examples and the audience', () => {
    expect(issues({ ...profile, voiceExamples: ['DM me at me@band.com'] })).toEqual([
      PROMOTION_VALIDATION.CONTACT_DETAILS,
    ])
    expect(issues({ ...profile, audience: 'fans of @bigcurator' })).toEqual([
      PROMOTION_VALIDATION.CONTACT_DETAILS,
    ])
  })

  it('refuses a repeated channel, no channel, and unknown fields', () => {
    expect(issues({ ...profile, channels: ['INSTAGRAM', 'INSTAGRAM'] })).toEqual([
      PROMOTION_VALIDATION.DUPLICATE_CHANNELS,
    ])
    expect(PromotionProfileSchema.safeParse({ ...profile, channels: [] }).success).toBe(false)
    expect(PromotionProfileSchema.safeParse({ ...profile, email: 'x' }).success).toBe(false)
  })
})

describe('UpdatePromotionStepSchema', () => {
  it('needs a title or a body to edit', () => {
    expect(UpdatePromotionStepSchema.safeParse({ action: 'edit' }).success).toBe(false)
    expect(UpdatePromotionStepSchema.safeParse({ action: 'edit', body: 'New text' }).success).toBe(
      true,
    )
  })

  it('refuses an unknown action', () => {
    expect(UpdatePromotionStepSchema.safeParse({ action: 'publish' }).success).toBe(false)
  })
})
