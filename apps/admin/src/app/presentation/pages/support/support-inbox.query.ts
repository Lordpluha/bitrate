import { coveringTuple } from '@domain/shared'
import type { SupportAudience, SupportChannel, SupportTicketStatus } from '@domain/support'
import { createQueryCodec, enumParam, intParam, type QueryCodec } from '@presentation/state'

export const SUPPORT_TICKET_STATUSES = coveringTuple<SupportTicketStatus>()(['open', 'resolved'])

export const SUPPORT_CHANNELS = coveringTuple<SupportChannel>()([
  'web',
  'telegram',
  'whatsapp',
  'instagram',
])

export const SUPPORT_AUDIENCES = coveringTuple<SupportAudience>()(['listener', 'artist'])

export type SupportInboxQuery = {
  status: SupportTicketStatus | null
  channel: SupportChannel | null
  audience: SupportAudience | null
  page: number
}

/**
 * `status` defaults to `open`: the inbox is a queue to empty, like moderation. "All" is only
 * reachable through the explicit `?status=all` token.
 */
export const supportInboxQueryCodec: QueryCodec<SupportInboxQuery> =
  createQueryCodec<SupportInboxQuery>({
    defaults: { status: 'open', channel: null, audience: null, page: 1 },
    fields: {
      status: {
        param: 'status',
        codec: enumParam({ members: SUPPORT_TICKET_STATUSES, default: 'open', nullToken: 'all' }),
      },
      channel: { param: 'channel', codec: enumParam({ members: SUPPORT_CHANNELS, default: null }) },
      audience: {
        param: 'audience',
        codec: enumParam({ members: SUPPORT_AUDIENCES, default: null }),
      },
      page: { param: 'page', codec: intParam(1) },
    },
  })
