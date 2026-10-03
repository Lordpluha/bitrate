import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminGenreEntity } from '../../entities'

/** Runs the get genre swagger operation. */
export function GetGenreSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminGenreEntity),
    ApiOperation({ summary: 'Get a genre by id, including reference counts' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminGenreEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Genre not found' }),
  )
}
