import { ApiProperty } from '@nestjs/swagger'
import type { User } from '@prisma/client'

/** Represents the user entity. */
export class UserEntity implements User {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The username value. */
  @ApiProperty()
  username: string

  /** The email value. */
  @ApiProperty()
  email: string

  /** The password value. */
  @ApiProperty({ nullable: true })
  password: string | null

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

  /** The two factor secret value. */
  @ApiProperty({ nullable: true })
  twoFactorSecret: string | null

  /** The two factor enabled value. */
  @ApiProperty()
  twoFactorEnabled: boolean
}
