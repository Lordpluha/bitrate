import { createAnthropic } from '@ai-sdk/anthropic'
import { createMistral } from '@ai-sdk/mistral'
import type { LanguageModel } from 'ai'
import { unpricedModels } from '../pricing'
import {
  type ApprovedProvider,
  type ModelRef,
  type PromotionModelConfig,
  PromotionModelConfigError,
  resolvePromotionRoutes,
} from '../routing'
import type { PromotionModels } from './promotion-models'

export interface PromotionProviderKeys {
  anthropicApiKey?: string | undefined
  mistralApiKey?: string | undefined
}

/**
 * Builds the promotion model set from configuration (ADR-0076). Only providers with a key
 * exist; every routed model must name one of them and have a price, or startup fails.
 */
export function createPromotionModels(
  config: PromotionModelConfig,
  keys: PromotionProviderKeys,
): PromotionModels {
  const factories = new Map<ApprovedProvider, (modelId: string) => LanguageModel>()
  if (keys.anthropicApiKey) {
    const anthropic = createAnthropic({ apiKey: keys.anthropicApiKey })
    factories.set('anthropic', (modelId) => anthropic(modelId))
  }
  if (keys.mistralApiKey) {
    const mistral = createMistral({ apiKey: keys.mistralApiKey })
    factories.set('mistral', (modelId) => mistral(modelId))
  }
  const routes = resolvePromotionRoutes(config, new Set(factories.keys()))
  const unpriced = unpricedModels(routes)
  if (unpriced.length > 0) {
    throw new PromotionModelConfigError(`No price is known for ${unpriced.join(', ')}`)
  }
  const cache = new Map<string, LanguageModel>()
  return {
    routes,
    languageModel(ref: ModelRef) {
      const known = cache.get(ref.id)
      if (known) return known
      const factory = factories.get(ref.provider)
      if (!factory) throw new PromotionModelConfigError(`No API key for "${ref.provider}"`)
      const model = factory(ref.modelId)
      cache.set(ref.id, model)
      return model
    },
  }
}
