import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { z } from 'zod'

/** A 128-bit key id, base64url without padding, as a ClearKey CDM writes it. */
const KEY_ID_BASE64URL = /^[A-Za-z0-9_-]{22}$/

/**
 * Body of `POST /tracks/:id/license`: the W3C ClearKey licence request the browser's CDM emits
 * on a `message` event (ADR-0077).
 */
export const TrackLicenseRequestSchema = z.object({
  kids: z.array(z.string().regex(KEY_ID_BASE64URL)).min(1).max(8),
  type: z.enum(['temporary']).optional(),
})

/** A ClearKey licence request. */
export class TrackLicenseRequestDto implements z.infer<typeof TrackLicenseRequestSchema> {
  @ApiProperty({
    type: [String],
    example: ['ASNFZ4mrze8BI0VniavN7w'],
    description: 'Key ids the CDM needs, base64url without padding',
  })
  kids: string[]

  @ApiPropertyOptional({ enum: ['temporary'] })
  type?: 'temporary'
}
