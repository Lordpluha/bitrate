import { type Audience, type Channel, SUPPORT_CHANNELS } from '@bitrate/support-core'
import type { PaginationInput } from '@common/pagination'
import type { Prisma, SupportTicketStatus } from '@prisma/client'
import { AUDIENCE_TO_DB, CHANNEL_TO_DB } from '../chat/support-enum-maps'

export { SUPPORT_CHANNELS }

export const SUPPORT_AUDIENCES = ['listener', 'artist'] as const satisfies readonly Audience[]

export const SUPPORT_TICKET_STATUSES = ['open', 'resolved'] as const

/** Whether a handed-off conversation still needs an operator, as the admin API speaks it. */
export type SupportTicketStatusValue = (typeof SUPPORT_TICKET_STATUSES)[number]

export const TICKET_STATUS_FROM_DB: Record<SupportTicketStatus, SupportTicketStatusValue> = {
  OPEN: 'open',
  RESOLVED: 'resolved',
}

const TICKET_STATUS_TO_DB: Record<SupportTicketStatusValue, SupportTicketStatus> = {
  open: 'OPEN',
  resolved: 'RESOLVED',
}

/** The inbox filters plus the page. */
export type SupportInboxQuery = PaginationInput & {
  status?: SupportTicketStatusValue
  channel?: Channel
  audience?: Audience
}

/** Only handed-off conversations (those with a ticket) reach the inbox. */
export function supportInboxWhere(query: SupportInboxQuery): Prisma.SupportConversationWhereInput {
  return {
    ticket: query.status ? { is: { status: TICKET_STATUS_TO_DB[query.status] } } : { isNot: null },
    ...(query.channel ? { channel: CHANNEL_TO_DB[query.channel] } : {}),
    ...(query.audience ? { audience: AUDIENCE_TO_DB[query.audience] } : {}),
  }
}
