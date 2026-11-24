import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PROMOTION_VALIDATION } from '../promotion.errors'
import { noContactDetails } from './no-contact-details'
import { PROMOTION_CHANNELS, PROMOTION_GOALS } from './promotion-enums'

export const PromotionProfileSchema = z.strictObject({
  goal: z.enum(PROMOTION_GOALS),
  channels: z
    .array(z.enum(PROMOTION_CHANNELS))
    .min(1)
    .max(PROMOTION_CHANNELS.length)
    .refine((list) => new Set(list).size === list.length, {
      message: PROMOTION_VALIDATION.DUPLICATE_CHANNELS,
    }),
  weeklyHours: z.number().int().min(1).max(40).describe('Hours a week the artist will spend'),
  countries: z
    .array(z.string().regex(/^[A-Z]{2}$/))
    .max(5)
    .describe('ISO 3166-1 alpha-2 codes of the main audience'),
  audience: noContactDetails(200).nullable(),
  voiceWords: z.array(z.string().trim().min(1).max(30)).max(3),
  voiceExamples: z.array(noContactDetails(500)).max(3).describe('Posts the artist wrote'),
})
export class PromotionProfileDto extends createZodDto(PromotionProfileSchema) {}
export type PromotionProfileInput = z.infer<typeof PromotionProfileSchema>
