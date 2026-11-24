import { describe, expect, it } from '@jest/globals'
import { toTokenUsage } from './to-token-usage'

describe('toTokenUsage', () => {
  it('bills cache reads separately from full-rate input', () => {
    expect(
      toTokenUsage({
        inputTokens: 1_200,
        outputTokens: 300,
        inputTokenDetails: { cacheReadTokens: 1_000 },
      }),
    ).toEqual({ inputTokens: 200, cachedInputTokens: 1_000, outputTokens: 300 })
  })

  it('reads missing counts as zero', () => {
    expect(toTokenUsage({})).toEqual({ inputTokens: 0, cachedInputTokens: 0, outputTokens: 0 })
  })
})
