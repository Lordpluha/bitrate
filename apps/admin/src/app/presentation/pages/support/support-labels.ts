import type {
  SupportAudience,
  SupportChannel,
  SupportConversationState,
  SupportMessageRole,
  SupportTicketStatus,
} from '@domain/support'

/** Translation keys and badge tones shared by the inbox and the conversation page. */
export const STATE_LABEL: Record<SupportConversationState, string> = {
  bot: 'support.state.bot',
  waiting_operator: 'support.state.waiting_operator',
  operator: 'support.state.operator',
  resolved: 'support.state.resolved',
}

export const STATE_BADGE: Record<
  SupportConversationState,
  'warning' | 'info' | 'success' | 'secondary'
> = {
  waiting_operator: 'warning',
  operator: 'info',
  resolved: 'success',
  bot: 'secondary',
}

export const TICKET_STATUS_LABEL: Record<SupportTicketStatus, string> = {
  open: 'support.status.open',
  resolved: 'support.status.resolved',
}

export const CHANNEL_LABEL: Record<SupportChannel, string> = {
  web: 'support.channel.web',
  telegram: 'support.channel.telegram',
  whatsapp: 'support.channel.whatsapp',
  instagram: 'support.channel.instagram',
}

export const AUDIENCE_LABEL: Record<SupportAudience, string> = {
  listener: 'support.audience.listener',
  artist: 'support.audience.artist',
}

export const ROLE_LABEL: Record<SupportMessageRole, string> = {
  user: 'supportConversation.role.user',
  assistant: 'supportConversation.role.assistant',
  operator: 'supportConversation.role.operator',
}
