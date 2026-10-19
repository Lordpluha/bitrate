import type { ArtistVerificationDelivery } from '@infra/mail/mail.service'
import { ApiProperty } from '@nestjs/swagger'

/** Delivery configuration is public and never reveals whether an account exists. */
export class ArtistEmailDeliveryEntity {
  @ApiProperty({ enum: ['email', 'development', 'unavailable'] })
  delivery: ArtistVerificationDelivery
}
