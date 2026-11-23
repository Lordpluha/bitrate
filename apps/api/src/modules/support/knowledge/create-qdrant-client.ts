import { QdrantClient } from '@qdrant/js-client-rest'
import type { KnowledgeConfig } from './knowledge-config'

/** Version compatibility is pinned by the image tag; the check costs a request per start. */
export function createQdrantClient(config: Pick<KnowledgeConfig, 'qdrantUrl' | 'qdrantApiKey'>) {
  return new QdrantClient({
    url: config.qdrantUrl,
    checkCompatibility: false,
    ...(config.qdrantApiKey ? { apiKey: config.qdrantApiKey } : {}),
  })
}
