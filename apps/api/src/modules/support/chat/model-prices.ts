/**
 * List prices in US dollars per million tokens, which equals micro-dollars per token.
 * Checked against Anthropic's model table on 2026-11-23; update with SUPPORT_CHAT_MODEL.
 */
export interface ModelPrice {
  input: number
  output: number
}

const PRICES: Readonly<Record<string, ModelPrice>> = {
  'anthropic:claude-haiku-5-5': { input: 0.1, output: 0.5 },
  'anthropic:claude-sonnet-5-5': { input: 2, output: 10 },
}

/** Unknown models are priced like Sonnet 5.5, so a misconfiguration cannot spend for free. */
const CONSERVATIVE_PRICE: ModelPrice = { input: 2, output: 10 }

export function modelPrice(modelId: string): ModelPrice {
  return PRICES[modelId] ?? CONSERVATIVE_PRICE
}
