import { describe, expect, it } from '@jest/globals'
import { RequestTranslationSchema } from './request-translation.dto'
import { UpdatePromotionPostSchema } from './update-promotion-post.dto'
import { UpdatePromotionTranslationSchema } from './update-translation.dto'

describe('post and translation DTOs', () => {
  it('needs something to change in a post, with well-formed hashtags', () => {
    expect(UpdatePromotionPostSchema.safeParse({}).success).toBe(false)
    expect(UpdatePromotionPostSchema.safeParse({ hashtags: ['#afterglow'] }).success).toBe(true)
    expect(UpdatePromotionPostSchema.safeParse({ hashtags: ['afterglow'] }).success).toBe(false)
  })

  it('translates only into the supported languages', () => {
    expect(RequestTranslationSchema.safeParse({ language: 'uk' }).success).toBe(true)
    expect(RequestTranslationSchema.safeParse({ language: 'de' }).success).toBe(false)
  })

  it('rates a translation only as good or needs work', () => {
    expect(UpdatePromotionTranslationSchema.safeParse({ rating: 1 }).success).toBe(true)
    expect(UpdatePromotionTranslationSchema.safeParse({ rating: 5 }).success).toBe(false)
    expect(UpdatePromotionTranslationSchema.safeParse({}).success).toBe(false)
  })
})
