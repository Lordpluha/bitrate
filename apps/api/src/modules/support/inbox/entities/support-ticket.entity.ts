import { ApiProperty } from '@nestjs/swagger'
import type { SupportTicket } from '@prisma/client'
import { type SupportTicketStatusValue, TICKET_STATUS_FROM_DB } from '../support-inbox-filter'

/** Why and since when a conversation waits for an operator. */
export class SupportTicketEntity {
  /** The assistant's one-sentence summary of what the user needs. */
  @ApiProperty()
  reason: string

  @ApiProperty({ enum: ['open', 'resolved'] })
  status: SupportTicketStatusValue

  @ApiProperty()
  createdAt: Date

  @ApiProperty({ type: Date, nullable: true })
  resolvedAt: Date | null

  static from(row: SupportTicket): SupportTicketEntity {
    return Object.assign(new SupportTicketEntity(), {
      reason: row.reason,
      status: TICKET_STATUS_FROM_DB[row.status],
      createdAt: row.createdAt,
      resolvedAt: row.resolvedAt,
    })
  }
}
