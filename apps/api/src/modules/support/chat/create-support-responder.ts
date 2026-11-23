import { createQdrantClient } from '../knowledge/create-qdrant-client'
import { loadSupportCore } from '../knowledge/load-support-core'
import { loadSupportModels } from '../knowledge/load-support-models'
import { QdrantKnowledgeIndex } from '../knowledge/qdrant-knowledge-index'
import type { SupportChatConfig } from './support-chat-config'
import type { SupportResponder } from './support-responder'

/**
 * The support agent from configuration: the chat model at low effort (short answers, and
 * thinking is billed as output), the embedding model, and the Qdrant knowledge index.
 */
export async function createSupportResponder(config: SupportChatConfig): Promise<SupportResponder> {
  const [{ SupportAgent }, { createSupportModels }] = await Promise.all([
    loadSupportCore(),
    loadSupportModels(),
  ])
  const models = createSupportModels({
    anthropicApiKey: config.anthropicApiKey,
    openaiApiKey: config.openaiApiKey,
  })
  return new SupportAgent({
    chatModel: models.chatModel(config.chatModel, { effort: 'low' }),
    embedder: models.embedder(config.embedModel),
    index: new QdrantKnowledgeIndex(createQdrantClient(config)),
  })
}
