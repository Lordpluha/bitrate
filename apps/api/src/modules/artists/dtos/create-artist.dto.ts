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

  /** Revision of the Terms of Use, Community Guidelines and Privacy Policy accepted at registration. */
  @ApiProperty({ required: false, type: String })
  legalVersion?: string

  /** When that revision was accepted. */
  @ApiProperty({ required: false, type: Date })
  legalAcceptedAt?: Date

  /** Revision of the Artist Agreement accepted at registration. */
  @ApiProperty({ required: false, type: String })
  artistAgreementVersion?: string

  /** When the Artist Agreement was accepted. */
  @ApiProperty({ required: false, type: Date })
  artistAgreementAcceptedAt?: Date
}
