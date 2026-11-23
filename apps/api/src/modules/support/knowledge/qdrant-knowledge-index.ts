import type { KnowledgeHit, KnowledgeIndex, KnowledgeQuery } from '@bitrate/support-core'
import type { QdrantClient } from '@qdrant/js-client-rest'
import { KNOWLEDGE_ALIAS } from './knowledge-collection-name'
import { parseKnowledgeHit } from './parse-knowledge-hit'

/** The support core's `KnowledgeIndex` over the Qdrant alias (ADR-0075). */
export class QdrantKnowledgeIndex implements KnowledgeIndex {
  constructor(private readonly client: QdrantClient) {}

  async search(query: KnowledgeQuery): Promise<KnowledgeHit[]> {
    const { points } = await this.client.query(KNOWLEDGE_ALIAS, {
      query: [...query.vector],
      limit: query.limit,
      with_payload: true,
      filter: {
        must: [
          { key: 'audience', match: { any: [...query.audiences] } },
          ...(query.locale === undefined
            ? []
            : [{ key: 'locale', match: { value: query.locale } }]),
        ],
      },
    })
    return points.flatMap((point) => {
      const hit = parseKnowledgeHit(point)
      return hit ? [hit] : []
    })
  }
}
