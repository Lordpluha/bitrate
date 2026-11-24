import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PROMOTION_VALIDATION } from '../promotion.errors'

export const UpdatePromotionTranslationSchema = z
  .strictObject({
    text: z.string().trim().min(1).max(4_096).optional(),
    rating: z
      .union([z.literal(1), z.literal(-1)])
      .optional()
      .describe('1 good, -1 needs work'),
  })
  .refine((input) => input.text !== undefined || input.rating !== undefined, {
    message: PROMOTION_VALIDATION.EDIT_EMPTY,
    path: ['text'],
  })
export class UpdatePromotionTranslationDto extends createZodDto(UpdatePromotionTranslationSchema) {}
export type UpdatePromotionTranslationInput = z.infer<typeof UpdatePromotionTranslationSchema>
