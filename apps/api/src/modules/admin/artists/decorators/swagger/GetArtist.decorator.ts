import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminArtistEntity } from '../../entities'

/** Runs the get artist swagger operation. */
export function GetArtistSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminArtistEntity),
    ApiOperation({ summary: 'Get an artist by id' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminArtistEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Artist not found' }),
  )
}
