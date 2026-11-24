import { z } from 'zod'

/** BullMQ queue of promotion model work; consumed in the API process like release publishing. */
export const PROMOTION_QUEUE = 'promotion'

export const PROMOTION_JOBS = {
  /** Fills a GENERATING plan version with suggested steps. */
  GENERATE_PLAN: 'generate-plan',
} as const

const generatePlanJobSchema = z.object({ planId: z.uuid() })
export type GeneratePlanJob = z.infer<typeof generatePlanJobSchema>
export const parseGeneratePlanJob = (data: unknown) => generatePlanJobSchema.safeParse(data)

/**
 * Provider failures and rejected output are settled inside the job (the plan becomes FAILED),
 * so a retry only covers database or Redis hiccups and never repeats a paid model call twice.
 */
export const PROMOTION_JOB_OPTIONS = {
  attempts: 2,
  backoff: { type: 'exponential' as const, delay: 5_000 },
  removeOnComplete: { age: 86_400, count: 1_000 },
  removeOnFail: { age: 604_800, count: 1_000 },
}
