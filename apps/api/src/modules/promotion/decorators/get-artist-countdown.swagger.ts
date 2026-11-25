import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { ArtistCountdownEntity } from '../entities'

export function GetArtistCountdownSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "The upcoming-release countdown of an artist's page",
      description:
        'Present while the artist has approved a countdown step of an unpublished release and ' +
        'its day has come; only the title, cover and release time are shown.',
    }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, type: ArtistCountdownEntity }),
  )
}
