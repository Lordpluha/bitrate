import { describe, expect, it } from '@jest/globals'
import { LegalAcceptanceSchema } from './legal-acceptance.dto'

describe('LegalAcceptanceSchema', () => {
  it('accepts an explicit acceptance', () => {
    expect(LegalAcceptanceSchema.parse({ acceptLegal: true })).toEqual({ acceptLegal: true })
  })

  it.each([
    {},
    { acceptLegal: false },
    { acceptLegal: 'true' },
    { acceptLegal: 1 },
  ])('refuses %p', (body) => {
    expect(LegalAcceptanceSchema.safeParse(body).success).toBe(false)
  })
})
