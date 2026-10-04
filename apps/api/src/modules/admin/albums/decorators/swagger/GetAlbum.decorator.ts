import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminAlbumDetailEntity } from '../../entities'

/** Runs the get album swagger operation. */
export function GetAlbumSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminAlbumDetailEntity),
    ApiOperation({
      summary: 'Get an album by id, including its tracks',
      description: 'A taken-down album stays reachable by id so it can be reviewed and restored.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminAlbumDetailEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Album not found' }),
  )
}
