import type { PromotionChannel, PromotionStepKind } from '@prisma/client'
import { z } from 'zod'
import { buildPlanRequest } from './build-plan-request'
import type { ProfileFacts, ReleaseFacts } from './plan-facts'
import { PLAN_SYSTEM_PROMPT } from './plan-system-prompt'

/** One rewritten step; the day, kind and channels stay as they were. */
export const StepOutputSchema = z.object({
  title: z.string().min(3).max(120),
  body: z.string().min(1).max(600),
})
export type StepOutput = z.infer<typeof StepOutputSchema>

export const STEP_SYSTEM_PROMPT = `${PLAN_SYSTEM_PROMPT}\nNow rewrite one step only: return its new title and text for the same day and kind.`

export const stepText = (output: StepOutput) => `${output.title}\n${output.body}`

/** The step as it is now, which the model rewrites. */
export interface StepToRewrite {
  offsetDays: number
  kind: PromotionStepKind
  channels: readonly PromotionChannel[]
  title: string
  body: string
}

/** The prompt and grounding facts for regenerating one step (spec D-13). */
export function buildStepRequest(
  release: ReleaseFacts,
  profile: ProfileFacts,
  step: StepToRewrite,
  hint?: string,
): { prompt: string; facts: string[] } {
  const { prompt, facts } = buildPlanRequest(release, profile, [])
  const channels = step.channels.length > 0 ? `, channels: ${step.channels.join(', ')}` : ''
  const lines = [
    prompt,
    '',
    `Rewrite this step (day ${step.offsetDays}, ${step.kind}${channels}):`,
    `Title: ${step.title}`,
    `Text: ${step.body}`,
    hint ? `The artist asks: ${hint}` : 'Suggest a different take.',
  ]
  return { prompt: lines.join('\n'), facts }
}
