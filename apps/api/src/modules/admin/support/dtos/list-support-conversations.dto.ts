import { paginationQuerySchema } from '@common/pagination'
import { SUPPORT_AUDIENCES, SUPPORT_CHANNELS, SUPPORT_TICKET_STATUSES } from '@modules/support'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/** Always newest activity first, so there is no `sort`: the inbox is a work queue. */
export const ListSupportConversationsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(SUPPORT_TICKET_STATUSES).optional(),
  channel: z.enum(SUPPORT_CHANNELS).optional(),
  audience: z.enum(SUPPORT_AUDIENCES).optional(),
})

export class ListSupportConversationsQueryDto extends createZodDto(
  ListSupportConversationsQuerySchema,
) {}
