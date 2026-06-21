import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Runs the get artist by id swagger operation. */
export function GetArtistByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get artist by id' }),
    ApiParam({ name: 'id', description: 'Artist ID (UUID)', type: 'string', format: 'uuid' }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: '#/components/schemas/SafeArtistEntity' },
    }),
  )
}
