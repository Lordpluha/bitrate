/**
 * BullMQ queue that rebuilds the support assistant's knowledge index in Qdrant (ADR-0075).
 * The API enqueues one ingest on start; a run whose sources are unchanged ends without work.
 */
export const SUPPORT_KNOWLEDGE_QUEUE = 'support-knowledge'

export const SUPPORT_KNOWLEDGE_JOBS = {
  /** Embed the bundled help articles and swap the index alias to the new collection. */
  INGEST: 'ingest',
} as const

/**
 * Retries cover a Qdrant or embedding provider that is still starting or briefly down.
 * The index is derived data: a failed run leaves the previous collection serving.
 */
export const SUPPORT_KNOWLEDGE_JOB_OPTIONS = {
  attempts: 5,
  backoff: { type: 'exponential' as const, delay: 30_000 },
  removeOnComplete: { age: 86_400, count: 100 },
  removeOnFail: { age: 604_800, count: 100 },
}
