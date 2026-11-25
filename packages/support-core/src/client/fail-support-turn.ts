import type { SupportChatState } from './chat-state.js'
import { withoutDraft } from './without-draft.js'

/** A request failed before streaming: its HTTP status, or `undefined` for a network failure. */
export function failSupportTurn(
  state: SupportChatState,
  status: number | undefined,
): SupportChatState {
  const next = status === undefined ? 'offline' : status === 429 ? 'limited' : 'error'
  return { status: next, messages: withoutDraft(state.messages) }
}
