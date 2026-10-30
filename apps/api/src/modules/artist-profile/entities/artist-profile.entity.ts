import { ApiProperty } from '@nestjs/swagger'

export class ArtistSocialLinksEntity {
  @ApiProperty({ required: false, format: 'uri' })
  website?: string

  @ApiProperty({ required: false, format: 'uri' })
  instagram?: string

  @ApiProperty({ required: false, format: 'uri' })
  x?: string

  @ApiProperty({ required: false, format: 'uri' })
  youtube?: string

  @ApiProperty({ required: false, format: 'uri' })
  tiktok?: string

  @ApiProperty({ required: false, format: 'uri' })
  soundcloud?: string
}

export class ArtistProfileEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ description: 'Public handle' })
  username: string

  @ApiProperty({ description: 'Sign-in email; never shown publicly' })
  email: string

  @ApiProperty({ type: String, nullable: true, maxLength: 500 })
  bio: string | null

  @ApiProperty({ type: String, nullable: true, example: 'UA' })
  country: string | null

  @ApiProperty({ type: ArtistSocialLinksEntity })
  socials: ArtistSocialLinksEntity

  @ApiProperty({ type: String, nullable: true, description: 'Public image path' })
  avatar: string | null

  @ApiProperty({ type: String, nullable: true, description: 'Public image path' })
  backgroundImage: string | null

  @ApiProperty({ description: 'Bitrate verification badge' })
  verified: boolean

  @ApiProperty()
  twoFactorEnabled: boolean

  @ApiProperty()
  emailVerified: boolean

  @ApiProperty({
    enum: ['en', 'uk', 'pl'],
    description: 'Workspace language; transactional emails follow it where a template exists',
  })
  locale: string

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date
}
