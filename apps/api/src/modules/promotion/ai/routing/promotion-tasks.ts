/**
 * Task routing types for promotion model calls (ADR-0076). Callers name a task, never a model:
 * configuration maps each task to a `provider:model` id and an optional fallback, the same id
 * format the support assistant uses (ADR-0074).
 */

/** What a model call is for; each task has its own price point. */
export const PROMOTION_TASKS = ['plan', 'copy', 'translate', 'check'] as const
export type PromotionTask = (typeof PROMOTION_TASKS)[number]

/**
 * Providers that passed due diligence (DPA with SCCs, no training on API data). A provider
 * outside this list cannot be configured, whatever its key.
 */
export const APPROVED_PROVIDERS = ['anthropic', 'mistral'] as const
export type ApprovedProvider = (typeof APPROVED_PROVIDERS)[number]

/** `provider:model`, as in `PROMOTION_MODEL_PLAN=anthropic:claude-sonnet-5-5`. */
export interface ModelRef {
  /** The id exactly as configured, used in logs and `AiUsage`. */
  id: string
  provider: ApprovedProvider
  modelId: string
}

export interface TaskRoute {
  primary: ModelRef
  fallback: ModelRef | null
}

export type PromotionRoutes = Record<PromotionTask, TaskRoute>

/** The configured model ids per task; a missing fallback means none. */
export type PromotionModelConfig = Record<
  PromotionTask,
  { primary: string; fallback?: string | undefined }
>
