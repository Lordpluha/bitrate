import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import type { ProviderV4 } from '@ai-sdk/provider'
import type { ChatModel, Embedder } from '../ports.js'
import { aiSdkChatModel } from './ai-sdk-chat-model.js'
import { aiSdkEmbedder } from './ai-sdk-embedder.js'
import { parseModelId } from './parse-model-id.js'
import { SupportModelConfigError } from './support-model-config-error.js'

export interface SupportModelKeys {
  anthropicApiKey?: string
  openaiApiKey?: string
}

export interface SupportModels {
  chatModel(id: string): ChatModel
  embedder(id: string): Embedder
}

const KNOWN_PROVIDERS = ['anthropic', 'openai'] as const

/**
 * Resolves `provider:model` ids from configuration to ports. A provider is available only
 * when its API key is set, so a typo or a missing key fails at startup.
 */
export function createSupportModels(keys: SupportModelKeys): SupportModels {
  const providers = new Map<string, ProviderV4>()
  if (keys.anthropicApiKey) {
    providers.set('anthropic', createAnthropic({ apiKey: keys.anthropicApiKey }))
  }
  if (keys.openaiApiKey) providers.set('openai', createOpenAI({ apiKey: keys.openaiApiKey }))

  const providerFor = (id: string): { provider: ProviderV4; modelId: string } => {
    const parsed = parseModelId(id)
    const provider = providers.get(parsed.provider)
    if (provider) return { provider, modelId: parsed.modelId }
    const known: readonly string[] = KNOWN_PROVIDERS
    throw new SupportModelConfigError(
      known.includes(parsed.provider)
        ? `Model provider "${parsed.provider}" is not configured: its API key is missing`
        : `Unknown model provider "${parsed.provider}"; supported: ${KNOWN_PROVIDERS.join(', ')}`,
    )
  }

  return {
    chatModel(id) {
      const { provider, modelId } = providerFor(id)
      return aiSdkChatModel(
        resolveModel(() => provider.languageModel(modelId), id),
        id,
      )
    },
    embedder(id) {
      const { provider, modelId } = providerFor(id)
      return aiSdkEmbedder(
        resolveModel(() => provider.embeddingModel(modelId), id),
        id,
      )
    },
  }
}

function resolveModel<T>(factory: () => T, id: string): T {
  try {
    return factory()
  } catch (error: unknown) {
    throw new SupportModelConfigError(`Model "${id}" is not available`, { cause: error })
  }
}
