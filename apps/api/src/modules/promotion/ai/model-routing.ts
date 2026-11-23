/**
 * Task routing for promotion model calls (ADR-0076). Callers name a task, never a model:
 * configuration maps each task to a `provider:model` id and an optional fallback, the same
 * id format the support assistant uses (ADR-0074).
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

/** Configuration names a model that cannot be used; raised at startup, never per request. */
export class PromotionModelConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PromotionModelConfigError'
  }
}

const isApproved = (provider: string): provider is ApprovedProvider =>
  (APPROVED_PROVIDERS as readonly string[]).includes(provider)

/** Parses and checks one `provider:model` id against the approved providers. */
export function parseModelRef(id: string): ModelRef {
  const trimmed = id.trim()
  const separator = trimmed.indexOf(':')
  const provider = trimmed.slice(0, separator)
  const modelId = trimmed.slice(separator + 1).trim()
  if (separator <= 0 || modelId === '') {
    throw new PromotionModelConfigError(`Model id "${id}" must look like "provider:model"`)
  }
  if (!isApproved(provider)) {
    throw new PromotionModelConfigError(
      `Provider "${provider}" is not approved for promotion (allowed: ${APPROVED_PROVIDERS.join(', ')})`,
    )
  }
  return { id: trimmed, provider, modelId }
}

/** The configured model ids per task; a missing fallback means none. */
export type PromotionModelConfig = Record<
  PromotionTask,
  { primary: string; fallback?: string | undefined }
>

/**
 * Resolves every task's route and checks that each provider it names has an API key, so a
 * typo or a missing key stops the process at startup.
 */
export function resolvePromotionRoutes(
  config: PromotionModelConfig,
  keyedProviders: ReadonlySet<ApprovedProvider>,
): PromotionRoutes {
  const requireKey = (ref: ModelRef, task: PromotionTask): ModelRef => {
    if (!keyedProviders.has(ref.provider)) {
      throw new PromotionModelConfigError(
        `Task "${task}" uses "${ref.id}", but no API key is set for "${ref.provider}"`,
      )
    }
    return ref
  }
  const routes = {} as PromotionRoutes
  for (const task of PROMOTION_TASKS) {
    const { primary, fallback } = config[task]
    const primaryRef = requireKey(parseModelRef(primary), task)
    const fallbackRef = fallback ? requireKey(parseModelRef(fallback), task) : null
    if (fallbackRef && fallbackRef.id === primaryRef.id) {
      throw new PromotionModelConfigError(`Task "${task}" names "${primary}" as its own fallback`)
    }
    routes[task] = { primary: primaryRef, fallback: fallbackRef }
  }
  return routes
}
