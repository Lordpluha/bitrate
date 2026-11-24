import type { EmbeddingModelV4 } from '@ai-sdk/provider'
import { embedMany } from 'ai'
import type { Embedder } from '../ports.js'
import { parseModelId } from './parse-model-id.js'
import { SupportModelError } from './support-model-error.js'

/** Wraps an AI SDK embedding model as an `Embedder`. */
export function aiSdkEmbedder(model: EmbeddingModelV4, id: string): Embedder {
  const { provider, modelId } = parseModelId(id)
  return {
    provider,
    modelId,
    async embed(texts, signal) {
      try {
        const result = await embedMany({
          model,
          values: [...texts],
          ...(signal ? { abortSignal: signal } : {}),
        })
        return result.embeddings
      } catch (error: unknown) {
        throw new SupportModelError(`Embedding model ${id} failed`, { cause: error })
      }
    },
  }
}
