import type { Citation } from '../domain.js'
import type { KnowledgeHit } from '../ports.js'

export function toCitation(hit: KnowledgeHit): Citation {
  return hit.url === undefined
    ? { chunkId: hit.chunkId, title: hit.title }
    : { chunkId: hit.chunkId, title: hit.title, url: hit.url }
}
