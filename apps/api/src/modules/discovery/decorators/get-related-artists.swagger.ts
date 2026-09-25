import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** List artists similar to a given artist, ranked by shared genres and listener count. */
export function GetRelatedArtistsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'List artists related to a given artist',
      description: 'Ranked by shared genres first, then monthly listeners and verification status.',
    }),
    ApiParam({ name: 'artistId', type: 'string', format: 'uuid' }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Maximum related artists to return (1-50, default 12)',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Related artists' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Limit out of range' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Artist not found' }),
  )
}
