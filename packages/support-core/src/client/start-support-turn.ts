import { type ChatMessage, DRAFT_ID, type SupportChatState } from './chat-state.js'

/** The user sent `text`: show it at once, with an empty reply bubble unless a person answers. */
export function startSupportTurn(state: SupportChatState, text: string): SupportChatState {
  const user: ChatMessage = { id: `user-${state.messages.length}`, role: 'user', text, sources: [] }
  const draft: ChatMessage = { id: DRAFT_ID, role: 'assistant', text: '', sources: [] }
  const waiting = state.status === 'waiting_operator'
  return { status: 'sending', messages: [...state.messages, user, ...(waiting ? [] : [draft])] }
}
