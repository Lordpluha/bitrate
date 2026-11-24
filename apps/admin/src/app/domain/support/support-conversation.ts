/** See `TrackProcessingStatus` for why these unions are declared here and not imported. */
export type SupportTicketStatus = 'open' | 'resolved'

export type SupportChannel = 'web' | 'telegram' | 'whatsapp' | 'instagram'

export type SupportAudience = 'listener' | 'artist'

/** Who answers the conversation now: the assistant, an operator (waiting or replying), or nobody. */
export type SupportConversationState = 'bot' | 'waiting_operator' | 'operator' | 'resolved'

export type SupportMessageRole = 'user' | 'assistant' | 'operator'

/** A knowledge-base source under an assistant answer. */
export type SupportCitation = {
  title: string
  url: string | null
}

export type SupportMessage = {
  id: string
  role: SupportMessageRole
  text: string
  citations: SupportCitation[]
  createdAt: Date
}

/** Why and since when a conversation waits for an operator. */
export type SupportTicket = {
  reason: string
  status: SupportTicketStatus
  createdAt: Date
  resolvedAt: Date | null
}

/** A handed-off conversation as the inbox lists it. */
export type SupportInboxItem = {
  id: string
  audience: SupportAudience
  channel: SupportChannel
  locale: string
  state: SupportConversationState
  /** Set when a signed-in listener wrote; guests and messenger contacts have none. */
  userId: string | null
  ticket: SupportTicket
  lastMessage: SupportMessage | null
  lastMessageAt: Date
  createdAt: Date
}

/** The conversation with its whole history, oldest message first. */
export type SupportConversation = SupportInboxItem & {
  messages: SupportMessage[]
}

export type SupportInboxFilter = {
  status?: SupportTicketStatus
  channel?: SupportChannel
  audience?: SupportAudience
}

/** The API's limit on one message, so the reply form can say it before sending. */
export const MAX_SUPPORT_REPLY_CHARS = 2000

/** Resolving a resolved ticket changes nothing but writes an audit entry, so it is skipped. */
export function canResolve(conversation: SupportInboxItem): boolean {
  return conversation.ticket.status === 'open'
}
