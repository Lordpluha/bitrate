import type { AppConfig } from '@common/config'
import type { FactoryProvider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { buildKnowledgeChunks } from './build-knowledge-chunks'
import { createKnowledgeEmbedder } from './create-knowledge-embedder'
import { createQdrantClient } from './create-qdrant-client'
import { readKnowledgeConfig } from './knowledge-config'
import { KNOWLEDGE_INGEST_DEPS, type KnowledgeIngestDeps } from './knowledge-ingest-deps'
import { QdrantKnowledgeStore } from './qdrant-knowledge-store'
import { readKnowledgeFiles } from './read-knowledge-files'

/** Wires the ingest to the filesystem, the support core, the embedding model and Qdrant. */
export const knowledgeIngestDepsProvider: FactoryProvider<KnowledgeIngestDeps> = {
  provide: KNOWLEDGE_INGEST_DEPS,
  inject: [ConfigService],
  useFactory: (configService: ConfigService<AppConfig>): KnowledgeIngestDeps => {
    const config = readKnowledgeConfig(configService)
    return {
      config,
      store: config ? new QdrantKnowledgeStore(createQdrantClient(config)) : undefined,
      readFiles: readKnowledgeFiles,
      toChunks: buildKnowledgeChunks,
      embed: config
        ? createKnowledgeEmbedder(config)
        : () => Promise.reject(new Error('Support knowledge embedding is not configured')),
    }
  },
}
