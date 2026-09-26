import { ApiProperty } from '@nestjs/swagger'

/** Represents the create artist dto. */
export class CreateArtistDto {
  /** The email value. */
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string

  /** The password value. */
  @ApiProperty({ description: 'User password', example: 'password123' })
  password: string

  /** The username value. */
  @ApiProperty({ description: 'User username', example: 'user123' })
  username: string
}
