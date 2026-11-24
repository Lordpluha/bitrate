/** Monthly AI spending ceilings in micro-dollars (spec: Free $2 hard, Artist $5 soft). */
export interface AiQuotaLimits {
  freeMicroUsd: number
}

/** Injection token for `AiQuotaLimits`, read from `PROMOTION_AI_MONTHLY_LIMIT_USD`. */
export const AI_QUOTA_LIMITS = Symbol('AI_QUOTA_LIMITS')

/** An artist's allowance for the current month. */
export interface AiAllowance {
  usedMicroUsd: number
  limitMicroUsd: number
  resetsAt: Date
}
