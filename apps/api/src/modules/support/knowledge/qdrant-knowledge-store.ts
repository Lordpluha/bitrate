import { randomUUID } from 'node:crypto'
import type { QdrantClient } from '@qdrant/js-client-rest'
import { KNOWLEDGE_ALIAS, KNOWLEDGE_COLLECTION_PREFIX } from './knowledge-collection-name'
import type { KnowledgePoint, KnowledgeStore } from './knowledge-store'
import { toKnowledgePayload } from './to-knowledge-payload'

/** Points per upsert request: well under Qdrant's request size limit for 1536-dim vectors. */
const UPSERT_BATCH = 128

/** Payload fields the search filters on. */
const FILTER_FIELDS = ['audience', 'locale'] as const

/**
 * Builds versioned collections and serves the newest through one alias, so a rebuild never
 * leaves the search without an index: the alias moves only after the new collection is full.
 */
export class QdrantKnowledgeStore implements KnowledgeStore {
  constructor(private readonly client: QdrantClient) {}

  async currentCollection(): Promise<string | undefined> {
    const { aliases } = await this.client.getAliases()
    return aliases.find((alias) => alias.alias_name === KNOWLEDGE_ALIAS)?.collection_name
  }

  async rebuild(collection: string, points: KnowledgePoint[]): Promise<void> {
    const size = points[0]?.vector.length
    if (!size) throw new Error('Cannot build a knowledge collection without points')

    const { collections } = await this.client.getCollections()
    if (collections.some((existing) => existing.name === collection)) {
      await this.client.deleteCollection(collection)
    }
    await this.client.createCollection(collection, { vectors: { size, distance: 'Cosine' } })
    for (const field_name of FILTER_FIELDS) {
      await this.client.createPayloadIndex(collection, {
        field_name,
        field_schema: 'keyword',
        wait: true,
      })
    }
    for (let start = 0; start < points.length; start += UPSERT_BATCH) {
      await this.client.upsert(collection, {
        wait: true,
        points: points.slice(start, start + UPSERT_BATCH).map(({ vector, chunk }) => ({
          id: randomUUID(),
          vector,
          payload: toKnowledgePayload(chunk),
        })),
      })
    }

    const previous = await this.currentCollection()
    await this.client.updateCollectionAliases({
      actions: [
        ...(previous ? [{ delete_alias: { alias_name: KNOWLEDGE_ALIAS } }] : []),
        { create_alias: { collection_name: collection, alias_name: KNOWLEDGE_ALIAS } },
      ],
    })
    await this.dropStaleCollections(collection)
  }

  private async dropStaleCollections(current: string) {
    const { collections } = await this.client.getCollections()
    for (const { name } of collections) {
      if (name.startsWith(KNOWLEDGE_COLLECTION_PREFIX) && name !== current) {
        await this.client.deleteCollection(name)
      }
    }
  }
}
