import type { AppConfig } from '@common/config'
import type { ConfigService } from '@nestjs/config'

/** Everything the knowledge ingest needs; absent when the feature is not configured. */
export interface KnowledgeConfig {
  qdrantUrl: string
  qdrantApiKey?: string
  openaiApiKey: string
  /** `provider:model`, e.g. `openai:text-embedding-3-small`. */
  embedModel: string
  /** Directory with `help/` and `legal/`. */
  knowledgeDir: string
}

/** `undefined` unless both Qdrant and the embedding provider are configured. */
export function readKnowledgeConfig(config: ConfigService<AppConfig>): KnowledgeConfig | undefined {
  const qdrantUrl = config.get('QDRANT_URL', { infer: true })
  const openaiApiKey = config.get('OPENAI_API_KEY', { infer: true })
  if (!(qdrantUrl && openaiApiKey)) return undefined
  const qdrantApiKey = config.get('QDRANT_API_KEY', { infer: true })
  return {
    qdrantUrl,
    ...(qdrantApiKey ? { qdrantApiKey } : {}),
    openaiApiKey,
    embedModel: config.getOrThrow('SUPPORT_EMBED_MODEL'),
    knowledgeDir: config.getOrThrow('SUPPORT_KNOWLEDGE_DIR'),
  }
}
