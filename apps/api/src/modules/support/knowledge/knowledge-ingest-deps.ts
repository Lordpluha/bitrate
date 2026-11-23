import type { KnowledgeChunk } from '@bitrate/support-core'
import type { KnowledgeConfig } from './knowledge-config'
import type { KnowledgeStore } from './knowledge-store'
import type { KnowledgeFile } from './read-knowledge-files'

export const KNOWLEDGE_INGEST_DEPS = Symbol('KNOWLEDGE_INGEST_DEPS')

/**
 * The ingest's collaborators. The production factory (`knowledge-ingest-deps.provider.ts`)
 * wires the filesystem, the ESM support core, the embedding model and Qdrant; tests pass fakes.
 * `config` and `store` are absent together when the feature is not configured.
 */
export interface KnowledgeIngestDeps {
  config: KnowledgeConfig | undefined
  store: KnowledgeStore | undefined
  readFiles(dir: string): Promise<KnowledgeFile[]>
  toChunks(files: readonly KnowledgeFile[]): Promise<KnowledgeChunk[]>
  embed(texts: readonly string[]): Promise<number[][]>
}
