import { ADMIN_RESOURCE_STATUSES } from '@modules/admin/shared'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { ADMIN_PLAYLISTS_SORT_FIELDS } from '../../dtos'
import { PaginatedAdminPlaylistsEntity } from '../../entities'

/** Runs the list playlists swagger operation. */
export function ListPlaylistsSwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedAdminPlaylistsEntity),
    ApiOperation({
      summary: 'List public playlists, newest first by default',
      description:
        'Only public playlists are listed; private ones are user content. A playlist an operator ' +
        'hid leaves this list and stays reachable by id.',
    }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'status', required: false, enum: ADMIN_RESOURCE_STATUSES }),
    ApiQuery({ name: 'ownerId', required: false, type: String, format: 'uuid' }),
    ApiQuery({ name: 'q', required: false, type: String, description: 'Search by title' }),
    ApiQuery({ name: 'sort', required: false, enum: ADMIN_PLAYLISTS_SORT_FIELDS }),
    ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of playlists',
      schema: { $ref: getSchemaPath(PaginatedAdminPlaylistsEntity) },
    }),
  )
}
