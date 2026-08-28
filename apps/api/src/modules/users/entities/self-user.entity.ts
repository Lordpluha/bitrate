import { ApiProperty } from '@nestjs/swagger'

/**
 * What a signed-in account may see about itself.
 *
 * Fields are declared rather than inherited from `SafeUserEntity`: the Swagger
 * CLI plugin reads decorators per file and emitted an empty schema for the
 * subclass, which left the generated client without these properties.
 */
export class SelfUserEntity {
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
  @ApiProperty({ nullable: true, type: String })
  description: string | null

  /** The avatar value. */
  @ApiProperty({ nullable: true, type: String })
  avatar: string | null

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date

  /** The email value. */
  @ApiProperty()
  email: string

  /** When the address was confirmed, or null while it is still unverified. */
  @ApiProperty({ nullable: true, type: Date })
  emailVerifiedAt: Date | null

  /** Whether two-factor authentication is switched on. */
  @ApiProperty()
  twoFactorEnabled: boolean
}
