import { describe, expect, it } from '@jest/globals'
import type { ApprovedProvider, PromotionModelConfig } from './promotion-tasks'
import { resolvePromotionRoutes } from './resolve-promotion-routes'

const config = (over: Partial<PromotionModelConfig> = {}): PromotionModelConfig => ({
  plan: { primary: 'anthropic:claude-sonnet-5-5', fallback: 'mistral:mistral-large-4' },
  copy: { primary: 'anthropic:claude-sonnet-5-5' },
  translate: { primary: 'anthropic:claude-haiku-5-5' },
  check: { primary: 'anthropic:claude-haiku-5-5', fallback: 'mistral:mistral-small-4' },
  ...over,
})
const both = new Set<ApprovedProvider>(['anthropic', 'mistral'])

describe('resolvePromotionRoutes', () => {
  it('resolves every task with its fallback', () => {
    const routes = resolvePromotionRoutes(config(), both)
    expect(routes.plan.primary.modelId).toBe('claude-sonnet-5-5')
    expect(routes.plan.fallback?.provider).toBe('mistral')
    expect(routes.copy.fallback).toBeNull()
  })

  it('fails at startup when a routed provider has no API key', () => {
    expect(() => resolvePromotionRoutes(config(), new Set(['anthropic']))).toThrow(
      /no API key is set for "mistral"/,
    )
  })

  it('rejects a task that falls back to itself', () => {
    expect(() =>
      resolvePromotionRoutes(
        config({
          copy: { primary: 'anthropic:claude-sonnet-5-5', fallback: 'anthropic:claude-sonnet-5-5' },
        }),
        both,
      ),
    ).toThrow(/its own fallback/)
  })
})
