import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PROMOTION_VALIDATION } from '../promotion.errors'

/** The channel limit is checked by the service, which knows the post's channel. */
export const UpdatePromotionPostSchema = z
  .strictObject({
    text: z.string().trim().min(1).max(4_096).optional(),
    hashtags: z
      .array(z.string().regex(/^#[\p{L}\p{N}_]{1,40}$/u))
      .max(8)
      .optional(),
  })
  .refine((input) => input.text !== undefined || input.hashtags !== undefined, {
    message: PROMOTION_VALIDATION.EDIT_EMPTY,
    path: ['text'],
  })
export class UpdatePromotionPostDto extends createZodDto(UpdatePromotionPostSchema) {}
export type UpdatePromotionPostInput = z.infer<typeof UpdatePromotionPostSchema>
