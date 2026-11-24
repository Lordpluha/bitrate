import { z } from 'zod'

/** A plan covers four weeks before and four weeks after the release date (spec D-11). */
export const PLAN_WINDOW_DAYS = 28

const CHANNELS = ['INSTAGRAM', 'TIKTOK', 'TELEGRAM', 'YOUTUBE_SHORTS'] as const
const KINDS = ['POST', 'FOLLOWER_MESSAGE', 'COUNTDOWN', 'ACTION'] as const

/** What the model must return; anything else counts as a rejected attempt. */
export const PlanOutputSchema = z.object({
  steps: z
    .array(
      z.object({
        offsetDays: z.number().int().min(-PLAN_WINDOW_DAYS).max(PLAN_WINDOW_DAYS),
        kind: z.enum(KINDS),
        channels: z.array(z.enum(CHANNELS)),
        title: z.string().min(3).max(120),
        body: z.string().min(1).max(600),
      }),
    )
    .min(3)
    .max(16),
})
export type PlanOutput = z.infer<typeof PlanOutputSchema>
