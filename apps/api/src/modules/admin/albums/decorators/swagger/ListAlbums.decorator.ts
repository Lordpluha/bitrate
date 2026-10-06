import { ADMIN_RESOURCE_STATUSES } from '@modules/admin/shared'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { ADMIN_ALBUMS_SORT_FIELDS } from '../../dtos'
import { PaginatedAdminAlbumsEntity } from '../../entities'

/** Runs the list albums swagger operation. */
export function ListAlbumsSwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedAdminAlbumsEntity),
    ApiOperation({ summary: 'List albums, newest first by default' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'status', required: false, enum: ADMIN_RESOURCE_STATUSES }),
    ApiQuery({ name: 'artistId', required: false, type: String, format: 'uuid' }),
    ApiQuery({ name: 'q', required: false, type: String, description: 'Search by title' }),
    ApiQuery({ name: 'sort', required: false, enum: ADMIN_ALBUMS_SORT_FIELDS }),
    ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of albums',
      schema: { $ref: getSchemaPath(PaginatedAdminAlbumsEntity) },
    }),
  )
}
