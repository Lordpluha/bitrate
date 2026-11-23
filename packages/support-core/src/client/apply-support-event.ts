import { type ChatMessage, DRAFT_ID, type SupportChatState } from './chat-state.js'
import type { ClientSupportEvent } from './support-client-event.js'
import { withoutDraft } from './without-draft.js'

/** One streamed event applied to the chat: text and sources go into the reply bubble. */
export function applySupportEvent(
  state: SupportChatState,
  event: ClientSupportEvent,
): SupportChatState {
  const update = (change: (draft: ChatMessage) => ChatMessage): SupportChatState => ({
    status: 'streaming',
    messages: state.messages.map((message) =>
      message.id === DRAFT_ID ? change(message) : message,
    ),
  })
  switch (event.type) {
    case 'text-delta':
      return update((draft) => ({ ...draft, text: draft.text + event.text }))
    case 'citation': {
      const { title, url } = event.citation
      const source = url ? { title, url } : { title }
      return update((draft) => ({ ...draft, sources: [...draft.sources, source] }))
    }
    case 'state':
      return state
    case 'done': {
      const person = event.outcome === 'handed-off' || event.outcome === 'forwarded'
      return { status: person ? 'waiting_operator' : 'idle', messages: settle(state.messages) }
    }
    case 'error':
      return { status: 'error', messages: withoutDraft(state.messages) }
  }
}

/** Keeps a finished reply under a stable id, or drops the bubble if nothing was said. */
function settle(messages: ChatMessage[]): ChatMessage[] {
  return messages.flatMap((message) => {
    if (message.id !== DRAFT_ID) return [message]
    return message.text === '' ? [] : [{ ...message, id: `reply-${messages.length}` }]
  })
}
