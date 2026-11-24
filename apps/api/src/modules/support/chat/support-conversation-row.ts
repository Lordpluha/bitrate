import type { Audience, Channel, ConversationState, Locale } from '@bitrate/support-core'

/** The conversation fields a turn needs, in the support core's vocabulary. */
export interface SupportConversationRow {
  id: string
  audience: Audience
  locale: Locale
  channel: Channel
  state: ConversationState
  inputTokens: number
  outputTokens: number
}
