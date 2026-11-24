import type { PromotionStepPhase } from '@prisma/client'

/** Before, on or after the release day, from a step's offset in days. */
export const phaseFor = (offsetDays: number): PromotionStepPhase =>
  offsetDays < 0 ? 'PRE' : offsetDays === 0 ? 'LAUNCH' : 'POST'
