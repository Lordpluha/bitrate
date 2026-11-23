import type { AppConfig } from '@common/config'
import type { ConfigService } from '@nestjs/config'

/** Everything the assistant needs to answer; absent when any part is not configured. */
export interface SupportChatConfig {
  chatModel: string
  embedModel: string
  anthropicApiKey: string
  openaiApiKey: string
  qdrantUrl: string
  qdrantApiKey?: string
}

/**
 * The assistant answers only with a chat key, an embedding key and Qdrant. Without them the
 * chat still works, but every conversation goes straight to an operator.
 */
export function readSupportChatConfig(
  config: ConfigService<AppConfig>,
): SupportChatConfig | undefined {
  const anthropicApiKey = config.get('ANTHROPIC_API_KEY', { infer: true })
  const openaiApiKey = config.get('OPENAI_API_KEY', { infer: true })
  const qdrantUrl = config.get('QDRANT_URL', { infer: true })
  if (!(anthropicApiKey && openaiApiKey && qdrantUrl)) return undefined
  const qdrantApiKey = config.get('QDRANT_API_KEY', { infer: true })
  return {
    chatModel: config.getOrThrow('SUPPORT_CHAT_MODEL'),
    embedModel: config.getOrThrow('SUPPORT_EMBED_MODEL'),
    anthropicApiKey,
    openaiApiKey,
    qdrantUrl,
    ...(qdrantApiKey ? { qdrantApiKey } : {}),
  }
}
