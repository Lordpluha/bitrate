import type { LanguageModel } from 'ai'
import type { ModelRef, PromotionRoutes } from '../routing'

/** Resolved routes plus a way to turn a route into an AI SDK model; built once at startup. */
export interface PromotionModels {
  routes: PromotionRoutes
  languageModel(ref: ModelRef): LanguageModel
}

/** Injection token; its value is `null` while `PROMOTION_AI_ENABLED` is off. */
export const PROMOTION_MODELS = Symbol('PROMOTION_MODELS')
