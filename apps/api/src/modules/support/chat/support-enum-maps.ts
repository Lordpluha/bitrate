import type { Audience, Channel, ConversationState, TranscriptMessage } from '@bitrate/support-core'
import type {
  SupportAudience,
  SupportChannel,
  SupportConversationState,
  SupportMessageRole,
} from '@prisma/client'

/*
 * The database stores SCREAMING enum values (repository convention); the support core and the
 * public API speak lowercase. These tables are the only place the two meet.
 */

export const AUDIENCE_TO_DB: Record<Audience, SupportAudience> = {
  listener: 'LISTENER',
  artist: 'ARTIST',
}

export const AUDIENCE_FROM_DB: Record<SupportAudience, Audience> = {
  LISTENER: 'listener',
  ARTIST: 'artist',
}

export const CHANNEL_FROM_DB: Record<SupportChannel, Channel> = {
  WEB: 'web',
  TELEGRAM: 'telegram',
  WHATSAPP: 'whatsapp',
  INSTAGRAM: 'instagram',
}

export const STATE_TO_DB: Record<ConversationState, SupportConversationState> = {
  bot: 'BOT',
  waiting_operator: 'WAITING_OPERATOR',
  operator: 'OPERATOR',
  resolved: 'RESOLVED',
}

export const STATE_FROM_DB: Record<SupportConversationState, ConversationState> = {
  BOT: 'bot',
  WAITING_OPERATOR: 'waiting_operator',
  OPERATOR: 'operator',
  RESOLVED: 'resolved',
}

export const ROLE_FROM_DB: Record<SupportMessageRole, TranscriptMessage['role']> = {
  USER: 'user',
  ASSISTANT: 'assistant',
  OPERATOR: 'operator',
}
