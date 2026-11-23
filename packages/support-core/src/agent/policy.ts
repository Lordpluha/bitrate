import type { ToolChoice } from '../ports.js'

/** Tuning of retrieval and of the tool loop. */
export interface SupportAgentPolicy {
  /** Model steps per turn, including the final answer. At least 2: search, then answer. */
  maxSteps: number
  /** Hits below this relevance score are treated as not found. */
  minRelevance: number
  /** Articles returned to the model per search. */
  maxHits: number
}

export const DEFAULT_POLICY: SupportAgentPolicy = {
  maxSteps: 4,
  minRelevance: 0.35,
  maxHits: 4,
}

/**
 * The first step must call a tool (search or hand off), the last must answer in text, so
 * every turn starts grounded and ends with something to show the user.
 */
export function toolChoiceForStep(step: number, policy: SupportAgentPolicy): ToolChoice {
  if (step === 0) return 'required'
  if (step === policy.maxSteps - 1) return 'none'
  return 'auto'
}
