import { ApiProperty } from '@nestjs/swagger'
import type { SupportTicket } from '@prisma/client'
import { SupportMessageEntity } from '../../chat/entities/support-message.entity'
import { SupportInboxItemEntity, type SupportInboxRow } from './support-inbox-item.entity'

/** A handed-off conversation with its whole history, oldest message first. */
export class SupportInboxConversationEntity extends SupportInboxItemEntity {
  @ApiProperty({ type: [SupportMessageEntity] })
  messages: SupportMessageEntity[]

  /** `row.messages` must be oldest first. */
  static fromHistory(
    row: SupportInboxRow & { ticket: SupportTicket },
  ): SupportInboxConversationEntity {
    const newestFirst = { ...row, messages: [...row.messages].reverse() }
    return Object.assign(
      new SupportInboxConversationEntity(),
      SupportInboxItemEntity.from(newestFirst),
      {
        messages: row.messages.map((message) => SupportMessageEntity.from(message)),
      },
    )
  }
}
