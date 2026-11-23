/** Who a conversation serves: listeners on web-player, artists on web-artists. */
export type Audience = 'listener' | 'artist'

/** Audience a knowledge article targets; `all` is shown to both audiences. */
export type KnowledgeAudience = Audience | 'all'

export const SUPPORTED_LOCALES = ['en', 'uk', 'pl'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const SUPPORT_CHANNELS = ['web', 'telegram', 'whatsapp', 'instagram'] as const
export type Channel = (typeof SUPPORT_CHANNELS)[number]

/**
 * Who answers the conversation right now.
 * `bot` → `waiting_operator` (handoff) → `operator` (first operator reply) → `resolved`.
 */
export type ConversationState = 'bot' | 'waiting_operator' | 'operator' | 'resolved'

/** One message of the stored transcript, as the host persists it. */
export interface TranscriptMessage {
  role: 'user' | 'assistant' | 'operator'
  text: string
}

/** What the host passes to the agent for one turn. */
export interface ConversationSnapshot {
  audience: Audience
  locale: Locale
  channel: Channel
  state: ConversationState
  /** Earlier turns, oldest first; the host decides how much history to keep. */
  history: readonly TranscriptMessage[]
}

/** A knowledge source shown under an answer. */
export interface Citation {
  chunkId: string
  title: string
  url?: string
}

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
}

/** How a turn ended. */
export type TurnOutcome =
  /** The assistant answered from the knowledge base. */
  | 'answered'
  /** The assistant handed the conversation to an operator. */
  | 'handed-off'
  /** A person owns the conversation; the message is for them, the model was not called. */
  | 'forwarded'
  /** The model produced no usable answer; a fixed fallback text was sent. */
  | 'fallback'

/** Events streamed by `SupportAgent.respond`, in order. */
export type SupportEvent =
  | { type: 'text-delta'; text: string }
  | { type: 'state'; state: ConversationState; reason?: string }
  | { type: 'citation'; citation: Citation }
  | { type: 'done'; outcome: TurnOutcome; usage: TokenUsage; grounded: boolean }
