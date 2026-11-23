import type { KnowledgeChunk } from '@bitrate/support-core'

/** What a Qdrant point stores: the chunk itself, so a search needs no second lookup. */
export function toKnowledgePayload(chunk: KnowledgeChunk): Record<string, string> {
  return {
    chunkId: chunk.id,
    slug: chunk.slug,
    title: chunk.title,
    audience: chunk.audience,
    locale: chunk.locale,
    text: chunk.text,
    ...(chunk.url === undefined ? {} : { url: chunk.url }),
  }
}
