import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PROMOTION_VALIDATION } from '../promotion.errors'
import { PROMOTION_STEP_ACTIONS } from './promotion-enums'

export const UpdatePromotionStepSchema = z
  .strictObject({
    action: z.enum(PROMOTION_STEP_ACTIONS),
    title: z.string().trim().min(3).max(120).optional().describe('Only with `edit`'),
    body: z.string().trim().min(1).max(600).optional().describe('Only with `edit`'),
  })
  .refine(
    (input) => input.action !== 'edit' || input.title !== undefined || input.body !== undefined,
    { message: PROMOTION_VALIDATION.EDIT_EMPTY, path: ['title'] },
  )
export class UpdatePromotionStepDto extends createZodDto(UpdatePromotionStepSchema) {}
export type UpdatePromotionStepInput = z.infer<typeof UpdatePromotionStepSchema>
