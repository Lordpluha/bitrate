import { type ChatMessage, DRAFT_ID } from './chat-state.js'

export function withoutDraft(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((message) => message.id !== DRAFT_ID)
}
