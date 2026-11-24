import { describe, expect, it } from '@jest/globals'
import { UpdatePromotionStepSchema } from './update-promotion-step.dto'

describe('UpdatePromotionStepSchema', () => {
  it('needs a title or a body to edit', () => {
    expect(UpdatePromotionStepSchema.safeParse({ action: 'edit' }).success).toBe(false)
    expect(UpdatePromotionStepSchema.safeParse({ action: 'edit', body: 'New text' }).success).toBe(
      true,
    )
  })

  it('accepts the other actions without text', () => {
    for (const action of ['approve', 'reject', 'done']) {
      expect(UpdatePromotionStepSchema.safeParse({ action }).success).toBe(true)
    }
  })

  it('refuses an unknown action', () => {
    expect(UpdatePromotionStepSchema.safeParse({ action: 'publish' }).success).toBe(false)
  })
})
