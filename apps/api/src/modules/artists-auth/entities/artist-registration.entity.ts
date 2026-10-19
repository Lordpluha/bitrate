import { ApiProperty } from '@nestjs/swagger'
import { ArtistEmailDeliveryEntity } from './artist-email-delivery.entity'

export class ArtistRegistrationEntity extends ArtistEmailDeliveryEntity {
  @ApiProperty({ enum: [true] })
  requiresEmailVerification: true
}
