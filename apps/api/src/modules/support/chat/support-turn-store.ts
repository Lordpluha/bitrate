import type {
  Citation,
  ConversationState,
  TokenUsage,
  TranscriptMessage,
} from '@bitrate/support-core'

/** What a finished turn changes. */
export interface TurnUpdate {
  /** The text the user saw; absent when nothing was said. */
  assistantText?: string
  citations: Citation[]
  state: ConversationState
  usage: TokenUsage
  /** Set when the turn handed the conversation to an operator: opens or reopens its ticket. */
  ticketReason?: string
}

/** Persistence a turn needs; implemented over Prisma by `SupportConversationStore`. */
export interface SupportTurnStore {
  addUserMessage(conversationId: string, text: string): Promise<void>
  /** Earlier messages, oldest first, without the one just added. */
  history(conversationId: string): Promise<TranscriptMessage[]>
  completeTurn(conversationId: string, update: TurnUpdate): Promise<void>
  /** Marks activity without a model turn (the message went to an operator). */
  touch(conversationId: string): Promise<void>
}
