import { describe, expect, it } from '@jest/globals'
import { ARTIST_AGREEMENT_VERSION } from './legal'
import {
  RIGHTS_CONFIRMATION_MESSAGE,
  RightsConfirmedSchema,
  rightsConfirmationRecord,
} from './rights-confirmation'

describe('RightsConfirmedSchema', () => {
  it.each([true, 'true'])('accepts %p as a confirmation', (value) => {
    expect(RightsConfirmedSchema.parse(value)).toBe(true)
  })

  it.each([false, 'false', '', 'yes', 1, null, undefined])('refuses %p', (value) => {
    const result = RightsConfirmedSchema.safeParse(value)

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(RIGHTS_CONFIRMATION_MESSAGE)
  })
})

describe('rightsConfirmationRecord', () => {
  it('records the current Artist Agreement revision and the given time', () => {
    const now = new Date('2026-10-01T12:00:00Z')

    expect(rightsConfirmationRecord(now)).toEqual({
      rightsConfirmedVersion: ARTIST_AGREEMENT_VERSION,
      rightsConfirmedAt: now,
    })
  })
})
