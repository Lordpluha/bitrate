import type { ConversationSnapshot } from '../domain.js'
import type { Embedder, KnowledgeHit, KnowledgeIndex } from '../ports.js'
import type { SupportAgentPolicy } from './policy.js'

export interface RetrievalDeps {
  embedder: Embedder
  index: KnowledgeIndex
  policy: SupportAgentPolicy
}

/**
 * Relevant hits for the conversation's audience (plus `all`) in the user's locale, falling
 * back to every locale when the user's has nothing relevant.
 */
export async function searchKnowledge(
  { embedder, index, policy }: RetrievalDeps,
  query: string,
  conversation: Pick<ConversationSnapshot, 'audience' | 'locale'>,
  signal?: AbortSignal,
): Promise<KnowledgeHit[]> {
  const [vector] = await embedder.embed([query], signal)
  if (!vector) throw new Error('Embedder returned no vector for the search query')
  const base = {
    vector,
    text: query,
    audiences: [conversation.audience, 'all'] as const,
    limit: policy.maxHits,
  }
  const relevant = (hits: KnowledgeHit[]) => hits.filter((hit) => hit.score >= policy.minRelevance)

  const local = relevant(await index.search({ ...base, locale: conversation.locale }, signal))
  if (local.length > 0) return local
  return relevant(await index.search(base, signal))
}
