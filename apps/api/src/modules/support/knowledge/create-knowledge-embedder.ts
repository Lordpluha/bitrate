import type { KnowledgeConfig } from './knowledge-config'
import { loadSupportModels } from './load-support-models'

/** `embed` for the ingest, resolved from `SUPPORT_EMBED_MODEL` on first use. */
export function createKnowledgeEmbedder(config: KnowledgeConfig) {
  return async (texts: readonly string[]): Promise<number[][]> => {
    const { createSupportModels } = await loadSupportModels()
    const embedder = createSupportModels({ openaiApiKey: config.openaiApiKey }).embedder(
      config.embedModel,
    )
    return embedder.embed(texts)
  }
}
