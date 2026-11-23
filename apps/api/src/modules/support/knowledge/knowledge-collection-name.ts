import { createHash } from 'node:crypto'
import type { KnowledgeFile } from './read-knowledge-files'

/** The alias the search reads; it points at the current versioned collection. */
export const KNOWLEDGE_ALIAS = 'support_knowledge'

/** Collections of this index all start with this; stale ones are dropped after a swap. */
export const KNOWLEDGE_COLLECTION_PREFIX = `${KNOWLEDGE_ALIAS}_`

/** Bump when chunking or the stored payload changes, so unchanged sources still rebuild. */
const INGEST_FORMAT_VERSION = 1

/**
 * A collection name that changes whenever the sources, the embedding model or the ingest
 * format change, so an unchanged deploy finds its collection already in place.
 */
export function knowledgeCollectionName(embedModel: string, files: readonly KnowledgeFile[]) {
  const hash = createHash('sha256').update(`v${INGEST_FORMAT_VERSION}\0${embedModel}\0`)
  for (const file of files) hash.update(`${file.kind}:${file.path}\0${file.raw}\0`)
  const model = embedModel.toLowerCase().replaceAll(/[^a-z0-9]/g, '_')
  return `${KNOWLEDGE_COLLECTION_PREFIX}${model}_${hash.digest('hex').slice(0, 12)}`
}
