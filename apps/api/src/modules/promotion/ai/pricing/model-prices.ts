/**
 * Prices in micro-dollars per token (= US$ per million tokens), from Anthropic's price list
 * of 2026-11-03 and Mistral's of 2026-11-10. Cached-input prices for Haiku 5.5 and Mistral
 * Small 4 are not published and are assumed at 10 % of input. Re-check them when a model is
 * added; a routed model without a price stops the process at startup, so `AiUsage` never
 * records an unknown cost.
 */
export interface ModelPrice {
  input: number
  cachedInput: number
  output: number
}

export const MODEL_PRICES: Readonly<Record<string, ModelPrice>> = {
  'anthropic:claude-opus-5-5': { input: 4, cachedInput: 0.2, output: 20 },
  'anthropic:claude-sonnet-5-5': { input: 2, cachedInput: 0.1, output: 10 },
  'anthropic:claude-haiku-5-5': { input: 0.1, cachedInput: 0.01, output: 0.5 },
  'mistral:mistral-large-4': { input: 0.7, cachedInput: 0.07, output: 2.1 },
  'mistral:mistral-small-4': { input: 0.15, cachedInput: 0.015, output: 0.6 },
}

export interface TokenUsage {
  /** Input tokens billed at the full rate. */
  inputTokens: number
  /** Input tokens served from the provider's prompt cache. */
  cachedInputTokens: number
  outputTokens: number
}
