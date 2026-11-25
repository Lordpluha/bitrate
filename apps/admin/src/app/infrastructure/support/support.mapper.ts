import type {
  SupportAudience,
  SupportChannel,
  SupportConversation,
  SupportConversationState,
  SupportInboxFilter,
  SupportInboxItem,
  SupportMessage,
  SupportMessageRole,
  SupportTicketStatus,
} from '@domain/support'
import type { WireFilters } from '../http/wire-page'
import type {
  SupportConversationDto,
  SupportItemDto,
  SupportMessageDto,
  WireSupportAudience,
  WireSupportChannel,
  WireSupportRole,
  WireSupportState,
  WireSupportTicketStatus,
} from './support.dto'

/*
 * The wire and the domain spell these alike today; the records keep them joined, so a member
 * the API grows later is a compile error here instead of a silent pass-through.
 */
const CHANNEL = {
  web: 'web',
  telegram: 'telegram',
  whatsapp: 'whatsapp',
  instagram: 'instagram',
} as const satisfies Record<WireSupportChannel, SupportChannel> &
  Record<SupportChannel, WireSupportChannel>

const AUDIENCE = {
  listener: 'listener',
  artist: 'artist',
} as const satisfies Record<WireSupportAudience, SupportAudience> &
  Record<SupportAudience, WireSupportAudience>

const STATE = {
  bot: 'bot',
  waiting_operator: 'waiting_operator',
  operator: 'operator',
  resolved: 'resolved',
} as const satisfies Record<WireSupportState, SupportConversationState>

const TICKET_STATUS = {
  open: 'open',
  resolved: 'resolved',
} as const satisfies Record<WireSupportTicketStatus, SupportTicketStatus> &
  Record<SupportTicketStatus, WireSupportTicketStatus>

const ROLE = {
  user: 'user',
  assistant: 'assistant',
  operator: 'operator',
} as const satisfies Record<WireSupportRole, SupportMessageRole>

function toSupportMessage(dto: SupportMessageDto): SupportMessage {
  return {
    id: dto.id,
    role: ROLE[dto.role],
    text: dto.text,
    citations: dto.citations.map((citation) => ({
      title: citation.title,
      url: citation.url ?? null,
    })),
    createdAt: new Date(dto.createdAt),
  }
}

export function toSupportInboxItem(dto: SupportItemDto): SupportInboxItem {
  return {
    id: dto.id,
    audience: AUDIENCE[dto.audience],
    channel: CHANNEL[dto.channel],
    locale: dto.locale,
    state: STATE[dto.state],
    userId: dto.userId,
    ticket: {
      reason: dto.ticket.reason,
      status: TICKET_STATUS[dto.ticket.status],
      createdAt: new Date(dto.ticket.createdAt),
      resolvedAt: dto.ticket.resolvedAt === null ? null : new Date(dto.ticket.resolvedAt),
    },
    lastMessage: dto.lastMessage === null ? null : toSupportMessage(dto.lastMessage),
    lastMessageAt: new Date(dto.lastMessageAt),
    createdAt: new Date(dto.createdAt),
  }
}

export function toSupportConversation(dto: SupportConversationDto): SupportConversation {
  return { ...toSupportInboxItem(dto), messages: dto.messages.map(toSupportMessage) }
}

export function toSupportListFilters(filter: SupportInboxFilter): WireFilters {
  return {
    status: filter.status === undefined ? undefined : TICKET_STATUS[filter.status],
    channel: filter.channel === undefined ? undefined : CHANNEL[filter.channel],
    audience: filter.audience === undefined ? undefined : AUDIENCE[filter.audience],
  }
}
