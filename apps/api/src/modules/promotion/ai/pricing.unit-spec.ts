import { describe, expect, it } from '@jest/globals'
import { parseModelRef, resolvePromotionRoutes } from './model-routing'
import { costMicroUsd, unpricedModels } from './pricing'

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

describe('unpricedModels', () => {
  it('lists routed models without a price', () => {
    const routes = resolvePromotionRoutes(
      {
        plan: { primary: 'anthropic:claude-sonnet-5-5', fallback: 'mistral:mistral-medium-9' },
        copy: { primary: 'anthropic:claude-sonnet-5-5' },
        translate: { primary: 'anthropic:claude-haiku-5-5' },
        check: { primary: 'anthropic:claude-haiku-5-5' },
      },
      new Set(['anthropic', 'mistral']),
    )
    expect(unpricedModels(routes)).toEqual(['mistral:mistral-medium-9'])
  })
})
