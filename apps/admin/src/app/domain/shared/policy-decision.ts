/** Whether an action is allowed, and — when it is not — why, for the UI to say so. */
export type PolicyDecision = { allowed: true } | { allowed: false; reason: string }

export const POLICY_ALLOWED: PolicyDecision = { allowed: true }
