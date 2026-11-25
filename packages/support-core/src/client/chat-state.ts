/** A message as the widget shows it. */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'operator'
  text: string
  sources: { title: string; url?: string }[]
}

/** Matches `SupportChatStatus` of `@bitrate/ui-react`. */
export type ChatStatus =
  | 'idle'
  | 'sending'
  | 'streaming'
  | 'waiting_operator'
  | 'error'
  | 'limited'
  | 'offline'

export interface SupportChatState {
  messages: ChatMessage[]
  status: ChatStatus
}

export const EMPTY_CHAT_STATE: SupportChatState = { messages: [], status: 'idle' }

/** Id of the reply bubble while it streams. */
export const DRAFT_ID = 'draft-reply'
