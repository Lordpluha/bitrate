import type { ConversationState, TurnOutcome } from '../domain.js'
import type { ClientSupportEvent } from './support-client-event.js'

const STATES: readonly ConversationState[] = ['bot', 'waiting_operator', 'operator', 'resolved']
const OUTCOMES: readonly TurnOutcome[] = ['answered', 'handed-off', 'forwarded', 'fallback']

type Fields = Record<string, unknown>

const isFields = (value: unknown): value is Fields => typeof value === 'object' && value !== null
const isString = (value: unknown): value is string => typeof value === 'string'

/** One SSE frame from the network as a typed event; `undefined` for anything unexpected. */
export function toClientEvent(type: string, data: unknown): ClientSupportEvent | undefined {
  if (!isFields(data)) return undefined
  switch (type) {
    case 'text-delta':
      return isString(data.text) ? { type, text: data.text } : undefined
    case 'state': {
      const state = STATES.find((known) => known === data.state)
      if (!state) return undefined
      return isString(data.reason) ? { type, state, reason: data.reason } : { type, state }
    }
    case 'citation': {
      const citation = data.citation
      if (!(isFields(citation) && isString(citation.chunkId) && isString(citation.title))) {
        return undefined
      }
      const { chunkId, title, url } = citation
      return { type, citation: isString(url) ? { chunkId, title, url } : { chunkId, title } }
    }
    case 'done': {
      const outcome = OUTCOMES.find((known) => known === data.outcome)
      return outcome ? { type, outcome, grounded: data.grounded === true } : undefined
    }
    case 'error':
      return { type, code: isString(data.code) ? data.code : 'unknown' }
    default:
      return undefined
  }
}
