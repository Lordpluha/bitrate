import type { KnowledgeChunk } from '@bitrate/support-core'

/** One indexed chunk with its embedding. */
export interface KnowledgePoint {
  vector: number[]
  chunk: KnowledgeChunk
}

/** Where the knowledge index lives; implemented over Qdrant (ADR-0075). */
export interface KnowledgeStore {
  /** The collection the search alias points at, if any. */
  currentCollection(): Promise<string | undefined>
  /** Builds `collection` from `points`, points the alias at it and drops older collections. */
  rebuild(collection: string, points: KnowledgePoint[]): Promise<void>
}
