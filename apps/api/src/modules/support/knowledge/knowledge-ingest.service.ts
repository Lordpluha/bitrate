import { Inject, Injectable, Logger } from '@nestjs/common'
import { knowledgeCollectionName } from './knowledge-collection-name'
import { KNOWLEDGE_INGEST_DEPS, type KnowledgeIngestDeps } from './knowledge-ingest-deps'

export type IngestResult =
  | { status: 'skipped-unconfigured' }
  | { status: 'unchanged'; collection: string }
  | { status: 'rebuilt'; collection: string; documents: number; chunks: number }

/**
 * Rebuilds the support knowledge index from the bundled sources (ADR-0075). Idempotent: when
 * the alias already points at the collection for these sources and this embedding model, it
 * returns without embedding anything.
 */
@Injectable()
export class KnowledgeIngestService {
  private readonly logger = new Logger(KnowledgeIngestService.name)

  constructor(@Inject(KNOWLEDGE_INGEST_DEPS) private readonly deps: KnowledgeIngestDeps) {}

  async ingest(): Promise<IngestResult> {
    const { config, store } = this.deps
    if (!(config && store)) {
      this.logger.log('Support knowledge ingest skipped: QDRANT_URL or OPENAI_API_KEY is not set')
      return { status: 'skipped-unconfigured' }
    }

    const files = await this.deps.readFiles(config.knowledgeDir)
    if (files.length === 0) {
      throw new Error(`Found no knowledge sources in ${config.knowledgeDir}`)
    }
    const collection = knowledgeCollectionName(config.embedModel, files)
    if ((await store.currentCollection()) === collection) {
      return { status: 'unchanged', collection }
    }

    const chunks = await this.deps.toChunks(files)
    const vectors = await this.deps.embed(chunks.map((chunk) => chunk.text))
    if (vectors.length !== chunks.length) {
      throw new Error(`Embedded ${vectors.length} of ${chunks.length} knowledge chunks`)
    }
    await store.rebuild(
      collection,
      chunks.map((chunk, index) => ({ chunk, vector: vectors[index] ?? [] })),
    )
    this.logger.log(`Support knowledge rebuilt: ${files.length} sources, ${chunks.length} chunks`)
    return { status: 'rebuilt', collection, documents: files.length, chunks: chunks.length }
  }
}
