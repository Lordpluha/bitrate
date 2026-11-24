import type { PromotionStepState } from '@prisma/client'
import type { UpdatePromotionStepInput } from '../dtos'

type StepAction = UpdatePromotionStepInput['action']

/** Steps the artist acted on; a regeneration carries them into the next version unchanged. */
export const KEPT_STATES: PromotionStepState[] = ['APPROVED', 'EDITED', 'DONE']

/** Which states each action may start from (spec D-13, D-21). */
export const ALLOWED_FROM: Record<StepAction, PromotionStepState[]> = {
  approve: ['SUGGESTED'],
  edit: ['SUGGESTED', 'APPROVED', 'EDITED'],
  reject: ['SUGGESTED', 'APPROVED', 'EDITED'],
  done: ['APPROVED', 'EDITED'],
}

/** The state each non-edit action leads to; an edit always leads to EDITED. */
export const TARGET_STATE: Record<Exclude<StepAction, 'edit'>, PromotionStepState> = {
  approve: 'APPROVED',
  reject: 'REJECTED',
  done: 'DONE',
}
