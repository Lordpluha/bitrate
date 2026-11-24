import type { PlanOutput } from './plan-output.schema'

/** The readable text of a generated plan, which the grounding check reads. */
export const planText = (output: PlanOutput) =>
  output.steps.map((step) => `${step.title}\n${step.body}`).join('\n')
