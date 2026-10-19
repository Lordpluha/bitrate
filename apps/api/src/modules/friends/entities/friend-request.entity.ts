import { SafeUserEntity } from '@modules/users'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** A pending request: `user` is the sender for incoming requests, the receiver for outgoing. */
export class FriendRequestEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date

  @ApiProperty({ type: SafeUserEntity })
  user: SafeUserEntity
}

/** The request as it stands after sending. */
export class SentFriendRequestEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date
}

/** `accepted` when the other person had already asked, which makes you friends right away. */
export class SendFriendRequestResultEntity {
  @ApiProperty({ enum: ['pending', 'accepted'] })
  status: 'pending' | 'accepted'

  @ApiPropertyOptional({ type: SentFriendRequestEntity })
  request?: SentFriendRequestEntity
}
