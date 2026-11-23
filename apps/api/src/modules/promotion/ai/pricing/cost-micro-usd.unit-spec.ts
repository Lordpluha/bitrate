import { describe, expect, it } from '@jest/globals'
import { parseModelRef } from '../routing'
import { costMicroUsd } from './cost-micro-usd'

describe('costMicroUsd', () => {
  it('prices full-rate, cached and output tokens separately', () => {
    // 1,000 × $2/M + 10,000 × $0.10/M + 500 × $10/M = $0.002 + $0.001 + $0.005
    expect(
      costMicroUsd(parseModelRef('anthropic:claude-sonnet-5-5'), {
        inputTokens: 1_000,
        cachedInputTokens: 10_000,
        outputTokens: 500,
      }),
    ).toBe(8_000)
  })

  it('rounds a fraction of a micro-dollar up', () => {
    expect(
      costMicroUsd(parseModelRef('anthropic:claude-haiku-5-5'), {
        inputTokens: 1,
        cachedInputTokens: 0,
        outputTokens: 0,
      }),
    ).toBe(1)
  })
})
