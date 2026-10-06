import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminGenreEntity } from '../../entities'

/** Runs the delete genre swagger operation. */
export function DeleteGenreSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminGenreEntity),
    ApiOperation({ summary: 'Physically delete an unreferenced genre' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminGenreEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Genre not found' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'Genre is still referenced by tracks, albums or artists; the body carries the counts',
    }),
  )
}
