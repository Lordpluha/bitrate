import { ApiProperty } from '@nestjs/swagger'

/** Represents the safe user entity. */
export class SafeUserEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The username value. */
  @ApiProperty()
  username: string

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The description value. */
  @ApiProperty()
  description: string | null

  /** The avatar value. */
  @ApiProperty()
  avatar: string | null

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date
}
