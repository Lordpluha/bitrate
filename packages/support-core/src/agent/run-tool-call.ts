import type { ConversationSnapshot } from '../domain.js'
import type { KnowledgeHit, ModelToolCall } from '../ports.js'
import { INVALID_INPUT_MARKER } from '../prompts/markers.js'
import { HANDOFF_TOOL, SEARCH_TOOL } from '../prompts/support-tools.js'
import { formatSearchResult } from './format-search-result.js'
import { readStringField } from './read-string-field.js'
import { type RetrievalDeps, searchKnowledge } from './search-knowledge.js'

/** Result of one tool call. */
export interface ToolOutcome {
  /** The tool result the model sees. */
  content: string
  /** Relevant hits the model was given; they become citations. */
  hits: KnowledgeHit[]
  /** Set when the model handed the conversation to an operator. */
  handoffReason?: string
}

/**
 * Runs one tool call. Invalid input and unknown tools are reported back to the model
 * instead of failing the turn.
 */
export async function runToolCall(
  call: ModelToolCall,
  conversation: ConversationSnapshot,
  deps: RetrievalDeps,
  signal?: AbortSignal,
): Promise<ToolOutcome> {
  if (call.name === HANDOFF_TOOL) {
    const reason = readStringField(call.input, 'reason')
    return { content: '', hits: [], handoffReason: reason ?? 'not given' }
  }
  if (call.name === SEARCH_TOOL) {
    const query = readStringField(call.input, 'query')
    if (!query) return invalid('search_knowledge needs a non-empty string "query"')
    const hits = await searchKnowledge(deps, query, conversation, signal)
    return { content: formatSearchResult(hits), hits }
  }
  return invalid(`unknown tool "${call.name}"`)
}

function invalid(detail: string): ToolOutcome {
  return { content: `${INVALID_INPUT_MARKER}: ${detail}`, hits: [] }
}
