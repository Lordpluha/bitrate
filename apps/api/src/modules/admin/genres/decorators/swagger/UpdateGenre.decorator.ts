import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { UpdateGenreDto } from '../../dtos'
import { AdminGenreEntity } from '../../entities'

/** Runs the update genre swagger operation. */
export function UpdateGenreSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminGenreEntity),
    ApiOperation({ summary: 'Update a genre' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: UpdateGenreDto }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminGenreEntity) } }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid name, slug or colour' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Genre not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Slug already in use' }),
  )
}
