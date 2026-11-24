import { describe, expect, it } from '@jest/globals'
import { parseModelRef } from './parse-model-ref'
import { PromotionModelConfigError } from './promotion-model-config.error'

describe('parseModelRef', () => {
  it('splits provider and model', () => {
    expect(parseModelRef(' anthropic:claude-sonnet-5-5 ')).toEqual({
      id: 'anthropic:claude-sonnet-5-5',
      provider: 'anthropic',
      modelId: 'claude-sonnet-5-5',
    })
  })

  it.each(['claude-sonnet-5-5', ':claude', 'anthropic:', 'anthropic: '])(
    'rejects the malformed id %j',
    (id) => {
      expect(() => parseModelRef(id)).toThrow(PromotionModelConfigError)
    },
  )

  it('rejects a provider that has not passed due diligence', () => {
    expect(() => parseModelRef('openai:gpt-6.1-sol')).toThrow(/not approved/)
  })
})
