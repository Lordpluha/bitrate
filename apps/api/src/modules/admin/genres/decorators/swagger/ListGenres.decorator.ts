import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { ADMIN_GENRES_SORT_FIELDS } from '../../dtos'
import { PaginatedAdminGenresEntity } from '../../entities'

/** Runs the list genres swagger operation. */
export function ListGenresSwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedAdminGenresEntity),
    ApiOperation({ summary: 'List genres with their reference counts' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'q', required: false, type: String, description: 'Search name/slug' }),
    ApiQuery({ name: 'sort', required: false, enum: ADMIN_GENRES_SORT_FIELDS }),
    ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of genres',
      schema: { $ref: getSchemaPath(PaginatedAdminGenresEntity) },
    }),
  )
}
