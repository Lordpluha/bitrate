import { ADMIN_RESOURCE_STATUSES } from '@modules/admin/shared'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { ADMIN_PODCASTS_SORT_FIELDS } from '../../dtos'
import { PaginatedAdminPodcastsEntity } from '../../entities'

/** Runs the list podcasts swagger operation. */
export function ListPodcastsSwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedAdminPodcastsEntity),
    ApiOperation({ summary: 'List podcasts, newest first by default' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'status', required: false, enum: ADMIN_RESOURCE_STATUSES }),
    ApiQuery({ name: 'q', required: false, type: String, description: 'Search by title' }),
    ApiQuery({ name: 'sort', required: false, enum: ADMIN_PODCASTS_SORT_FIELDS }),
    ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of podcasts',
      schema: { $ref: getSchemaPath(PaginatedAdminPodcastsEntity) },
    }),
  )
}
