import { describe, expect, it } from '@jest/globals'
import { CreateReportSchema } from './moderation.dto'

describe('CreateReportSchema', () => {
  it('rejects unsupported entity types', () => {
    expect(
      CreateReportSchema.safeParse({
        entityType: 'comment',
        entityId: '018f47a2-7b5d-7cc3-8d25-8aa38e5f4ea2',
        reason: 'Harmful content',
      }).success,
    ).toBe(false)
  })

  it('trims and validates human-entered report text', () => {
    expect(
      CreateReportSchema.parse({
        entityType: 'track',
        entityId: '018f47a2-7b5d-7cc3-8d25-8aa38e5f4ea2',
        reason: '  Harmful content  ',
        details: '  Details  ',
      }),
    ).toMatchObject({ reason: 'Harmful content', details: 'Details' })
  })
})
