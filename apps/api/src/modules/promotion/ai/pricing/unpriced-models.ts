import type { PromotionRoutes } from '../routing'
import { MODEL_PRICES } from './model-prices'

/** The routed model ids that have no price; empty when every route can be costed. */
export function unpricedModels(routes: PromotionRoutes): string[] {
  const ids = Object.values(routes).flatMap((route) =>
    route.fallback ? [route.primary.id, route.fallback.id] : [route.primary.id],
  )
  return [...new Set(ids)].filter((id) => !MODEL_PRICES[id])
}
