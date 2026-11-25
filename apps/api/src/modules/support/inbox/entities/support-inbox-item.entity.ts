import type { Channel } from '@bitrate/support-core'
import { ApiProperty } from '@nestjs/swagger'
import type { SupportConversation, SupportMessage, SupportTicket } from '@prisma/client'
import { SupportMessageEntity } from '../../chat/entities/support-message.entity'
import { AUDIENCE_FROM_DB, CHANNEL_FROM_DB, STATE_FROM_DB } from '../../chat/support-enum-maps'
import { SUPPORT_CHANNELS } from '../support-inbox-filter'
import { SupportTicketEntity } from './support-ticket.entity'

/** A conversation row with its ticket; `messages` holds what the caller included. */
export type SupportInboxRow = SupportConversation & {
  ticket: SupportTicket | null
  messages: SupportMessage[]
}

/** A handed-off conversation as the operator inbox lists it. */
export class SupportInboxItemEntity {
  @ApiProperty()
  id: string

  @ApiProperty({ enum: ['listener', 'artist'] })
  audience: 'listener' | 'artist'

  @ApiProperty({ enum: SUPPORT_CHANNELS })
  channel: Channel

  @ApiProperty({ enum: ['en', 'uk', 'pl'] })
  locale: string

  @ApiProperty({ enum: ['bot', 'waiting_operator', 'operator', 'resolved'] })
  state: 'bot' | 'waiting_operator' | 'operator' | 'resolved'

  /** Set when a signed-in listener wrote; guests and messenger contacts have none. */
  @ApiProperty({ type: String, nullable: true, format: 'uuid' })
  userId: string | null

  @ApiProperty({ type: SupportTicketEntity })
  ticket: SupportTicketEntity

  /** The newest message, for the list preview. */
  @ApiProperty({ type: SupportMessageEntity, nullable: true })
  lastMessage: SupportMessageEntity | null

  @ApiProperty()
  lastMessageAt: Date

  @ApiProperty()
  createdAt: Date

  /** `row.messages` must be newest first; only the first one is used. */
  static from(row: SupportInboxRow & { ticket: SupportTicket }): SupportInboxItemEntity {
    const [newest] = row.messages
    return Object.assign(new SupportInboxItemEntity(), {
      id: row.id,
      audience: AUDIENCE_FROM_DB[row.audience],
      channel: CHANNEL_FROM_DB[row.channel],
      locale: row.locale,
      state: STATE_FROM_DB[row.state],
      userId: row.userId,
      ticket: SupportTicketEntity.from(row.ticket),
      lastMessage: newest ? SupportMessageEntity.from(newest) : null,
      lastMessageAt: row.lastMessageAt,
      createdAt: row.createdAt,
    })
  }
}
