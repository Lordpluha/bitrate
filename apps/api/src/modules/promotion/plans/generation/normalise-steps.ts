import type { PromotionChannel } from '@prisma/client'
import { phaseFor } from './phase-for'
import type { PlanStepRow } from './plan-facts'
import type { PlanOutput } from './plan-output.schema'

/**
 * Turns model output into step rows: phase from the offset, channels limited to the artist's,
 * one follower message on release day, countdowns only before it, ordered by date.
 */
export function normaliseSteps(
  output: PlanOutput,
  channels: readonly PromotionChannel[],
  firstPosition: number,
): PlanStepRow[] {
  const allowed = new Set(channels)
  let followerMessage = false
  const rows: Omit<PlanStepRow, 'position'>[] = []
  for (const step of output.steps) {
    if (step.kind === 'FOLLOWER_MESSAGE') {
      if (followerMessage) continue
      followerMessage = true
    }
    if (step.kind === 'COUNTDOWN' && step.offsetDays >= 0) continue
    const offsetDays = step.kind === 'FOLLOWER_MESSAGE' ? 0 : step.offsetDays
    const stepChannels = step.kind === 'POST' ? step.channels.filter((c) => allowed.has(c)) : []
    if (step.kind === 'POST' && stepChannels.length === 0) continue
    rows.push({
      offsetDays,
      phase: phaseFor(offsetDays),
      kind: step.kind,
      channels: stepChannels,
      title: step.title.trim(),
      body: step.body.trim(),
    })
  }
  return rows
    .sort((a, b) => a.offsetDays - b.offsetDays)
    .map((row, i) => ({ ...row, position: firstPosition + i }))
}
