import { describe, expect, it } from '@jest/globals'
import { resolvePromotionRoutes } from '../routing'
import { unpricedModels } from './unpriced-models'

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
