import type { ModelRef } from '../routing'
import { MODEL_PRICES, type TokenUsage } from './model-prices'

/** Cost of one call in whole micro-dollars, rounded up so a ceiling is never under-counted. */
export function costMicroUsd(ref: ModelRef, usage: TokenUsage): number {
  const price = MODEL_PRICES[ref.id]
  if (!price) throw new Error(`No price for model "${ref.id}"`)
  return Math.ceil(
    usage.inputTokens * price.input +
      usage.cachedInputTokens * price.cachedInput +
      usage.outputTokens * price.output,
  )
}
