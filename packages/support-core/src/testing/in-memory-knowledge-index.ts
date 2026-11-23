import type { KnowledgeHit, KnowledgeIndex, KnowledgeQuery } from '../ports.js'

/** A knowledge hit stored with the filters the index applies. */
export interface StoredHit extends KnowledgeHit {
  audience: KnowledgeQuery['audiences'][number]
  locale: NonNullable<KnowledgeQuery['locale']>
}

/** Returns stored hits that pass the audience and locale filters, best first. */
export class InMemoryKnowledgeIndex implements KnowledgeIndex {
  readonly queries: KnowledgeQuery[] = []
  private readonly hits: StoredHit[]

  constructor(hits: StoredHit[]) {
    this.hits = hits
  }

  async search(query: KnowledgeQuery): Promise<KnowledgeHit[]> {
    this.queries.push(query)
    return this.hits
      .filter((hit) => query.audiences.includes(hit.audience))
      .filter((hit) => query.locale === undefined || hit.locale === query.locale)
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit)
      .map(({ audience: _audience, locale: _locale, ...hit }) => hit)
  }
}
