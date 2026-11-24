import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { SupportConversationEntity } from './support-conversation.entity'

/** A new conversation, and for a guest the token that opens it (`x-support-token`). */
export class SupportConversationCreatedEntity {
  @ApiProperty({ type: SupportConversationEntity })
  conversation: SupportConversationEntity

  /** Shown once and stored only as a hash: the guest client must keep it. */
  @ApiPropertyOptional()
  token?: string
}
