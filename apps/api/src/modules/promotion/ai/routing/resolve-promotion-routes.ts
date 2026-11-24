import { parseModelRef } from './parse-model-ref'
import { PromotionModelConfigError } from './promotion-model-config.error'
import {
  type ApprovedProvider,
  type ModelRef,
  PROMOTION_TASKS,
  type PromotionModelConfig,
  type PromotionRoutes,
  type PromotionTask,
} from './promotion-tasks'

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
