import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { findContactDetails } from '../ai/contact-details'
import { PROMOTION_VALIDATION } from '../promotion.errors'

export const PROMOTION_GOALS = ['STREAMS', 'FOLLOWERS', 'BUZZ'] as const
export const PROMOTION_CHANNELS = ['INSTAGRAM', 'TIKTOK', 'TELEGRAM', 'YOUTUBE_SHORTS'] as const
export const PROMOTION_STEP_ACTIONS = ['approve', 'edit', 'reject', 'done'] as const

/** Text the artist writes for AI must carry no contact details (ADR-0076: minimal data). */
const noContactDetails = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((text) => findContactDetails(text).length === 0, {
      message: PROMOTION_VALIDATION.CONTACT_DETAILS,
    })

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

export const UpdatePromotionStepSchema = z
  .strictObject({
    action: z.enum(PROMOTION_STEP_ACTIONS),
    title: z.string().trim().min(3).max(120).optional().describe('Only with `edit`'),
    body: z.string().trim().min(1).max(600).optional().describe('Only with `edit`'),
  })
  .refine(
    (input) => input.action !== 'edit' || input.title !== undefined || input.body !== undefined,
    {
      message: PROMOTION_VALIDATION.EDIT_EMPTY,
      path: ['title'],
    },
  )
export class UpdatePromotionStepDto extends createZodDto(UpdatePromotionStepSchema) {}
export type UpdatePromotionStepInput = z.infer<typeof UpdatePromotionStepSchema>
export type PromotionProfileInput = z.infer<typeof PromotionProfileSchema>
