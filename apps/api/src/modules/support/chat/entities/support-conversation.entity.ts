import { ApiProperty } from '@nestjs/swagger'
import type { SupportConversation, SupportMessage } from '@prisma/client'
import { AUDIENCE_FROM_DB, STATE_FROM_DB } from '../support-enum-maps'
import { SupportMessageEntity } from './support-message.entity'

/** A support conversation with its messages, oldest first. */
export class SupportConversationEntity {
  @ApiProperty()
  id: string

  @ApiProperty({ enum: ['listener', 'artist'] })
  audience: 'listener' | 'artist'

  @ApiProperty({ enum: ['en', 'uk', 'pl'] })
  locale: string

  /** Who answers now: the assistant, an operator (waiting or replying), or nobody. */
  @ApiProperty({ enum: ['bot', 'waiting_operator', 'operator', 'resolved'] })
  state: 'bot' | 'waiting_operator' | 'operator' | 'resolved'

  @ApiProperty({ type: [SupportMessageEntity] })
  messages: SupportMessageEntity[]

  @ApiProperty()
  createdAt: Date

  static from(
    row: SupportConversation & { messages: SupportMessage[] },
  ): SupportConversationEntity {
    return Object.assign(new SupportConversationEntity(), {
      id: row.id,
      audience: AUDIENCE_FROM_DB[row.audience],
      locale: row.locale,
      state: STATE_FROM_DB[row.state],
      messages: row.messages.map((message) => SupportMessageEntity.from(message)),
      createdAt: row.createdAt,
    })
  }
}
