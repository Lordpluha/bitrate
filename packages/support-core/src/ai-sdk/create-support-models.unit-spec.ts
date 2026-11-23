import { MockEmbeddingModelV4 } from 'ai/test'
import { describe, expect, it } from 'vitest'
import { aiSdkEmbedder } from './ai-sdk-embedder.js'
import { createSupportModels } from './create-support-models.js'
import { SupportModelConfigError } from './support-model-config-error.js'

describe('aiSdkEmbedder', () => {
  it('returns one vector per text, in order', async () => {
    const model = new MockEmbeddingModelV4({
      doEmbed: async ({ values }) => ({
        embeddings: values.map((value) => [value.length, 0.5]),
        warnings: [],
      }),
    })

    const vectors = await aiSdkEmbedder(model, 'mock:embed').embed(['a', 'abc'])

    expect(vectors).toEqual([
      [1, 0.5],
      [3, 0.5],
    ])
  })
})

describe('createSupportModels (AC-6)', () => {
  const models = createSupportModels({ anthropicApiKey: 'test', openaiApiKey: 'test' })

  it('resolves models of different providers from provider:model ids', () => {
    expect(models.chatModel('anthropic:claude-haiku-5-5')).toMatchObject({
      provider: 'anthropic',
      modelId: 'claude-haiku-5-5',
    })
    expect(models.chatModel('openai:gpt-5.5-mini')).toMatchObject({
      provider: 'openai',
      modelId: 'gpt-5.5-mini',
    })
    expect(models.embedder('openai:text-embedding-3-small')).toMatchObject({
      provider: 'openai',
      modelId: 'text-embedding-3-small',
    })
  })

  it('rejects malformed ids and unconfigured providers with a clear error', () => {
    expect(() => models.chatModel('claude-haiku-5-5')).toThrow(SupportModelConfigError)
    expect(() => models.chatModel('mistral:large')).toThrow(/anthropic, openai/)
    expect(() => models.embedder('anthropic:')).toThrow(SupportModelConfigError)
  })

  it('only offers providers that have an API key', () => {
    const anthropicOnly = createSupportModels({ anthropicApiKey: 'test' })

    expect(() => anthropicOnly.embedder('openai:text-embedding-3-small')).toThrow(/not configured/)
  })
})
