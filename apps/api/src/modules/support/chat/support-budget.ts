import type { TokenUsage } from '@bitrate/support-core'

/** The monthly model budget of the support assistant (#567: $10 per month). */
export interface SupportBudget {
  /** False once this month's spend reached the budget. */
  canSpend(): Promise<boolean>
  /** Adds the cost of one turn to this month's spend. */
  record(usage: TokenUsage): Promise<void>
}
