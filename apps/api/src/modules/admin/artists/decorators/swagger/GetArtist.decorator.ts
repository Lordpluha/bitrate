import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminArtistDetailEntity } from '../../entities'

/** Runs the get artist swagger operation. */
export function GetArtistSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminArtistDetailEntity),
    ApiOperation({ summary: 'Get an artist by id, including tracks/albums/session counts' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: getSchemaPath(AdminArtistDetailEntity) },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Artist not found' }),
  )
}
