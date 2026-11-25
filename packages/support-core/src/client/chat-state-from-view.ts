import type { SupportChatState } from './chat-state.js'
import type { SupportConversationView } from './to-conversation-view.js'

/** The conversation as loaded from the API. */
export function chatStateFromView(view: SupportConversationView): SupportChatState {
  const waiting = view.state === 'waiting_operator' || view.state === 'operator'
  return {
    status: waiting ? 'waiting_operator' : 'idle',
    messages: view.messages.map(({ id, role, text, citations }) => ({
      id,
      role,
      text,
      sources: citations.map(({ title, url }) => (url ? { title, url } : { title })),
    })),
  }
}
