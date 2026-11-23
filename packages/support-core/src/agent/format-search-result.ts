import type { KnowledgeHit } from '../ports.js'
import { NO_RESULTS_MARKER } from '../prompts/markers.js'

/**
 * The search tool result the model sees: each hit inside an `<article>` tag, which the
 * system prompt declares to be data, never instructions.
 */
export function formatSearchResult(hits: readonly KnowledgeHit[]): string {
  if (hits.length === 0) return NO_RESULTS_MARKER
  return hits
    .map(
      (hit, position) =>
        `<article index="${position + 1}" title="${escapeAttribute(hit.title)}">\n${hit.text}\n</article>`,
    )
    .join('\n')
}

function escapeAttribute(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
}
