import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { ArtistAnalyticsEntity } from '../entities/artist-analytics.entity'

export function ArtistAnalyticsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Bitrate listening analytics for the artist's tracks",
      description:
        'Plays and listeners from Bitrate playback only, per UTC day, with the previous period for comparison. External services read NOT_CONNECTED.',
    }),
    ApiQuery({ name: 'days', required: false, enum: [7, 28, 90] }),
    ApiResponse({ status: HttpStatus.OK, type: ArtistAnalyticsEntity }),
  )
}
