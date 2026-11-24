import type { TokenUsage } from '../pricing'

/** AI SDK usage → billed token counts; cached input is billed at its own rate. */
export function toTokenUsage(usage: {
  inputTokens?: number | undefined
  outputTokens?: number | undefined
  inputTokenDetails?: { cacheReadTokens?: number | undefined } | undefined
}): TokenUsage {
  const input = usage.inputTokens ?? 0
  const cached = usage.inputTokenDetails?.cacheReadTokens ?? 0
  return {
    inputTokens: Math.max(input - cached, 0),
    cachedInputTokens: cached,
    outputTokens: usage.outputTokens ?? 0,
  }
}
