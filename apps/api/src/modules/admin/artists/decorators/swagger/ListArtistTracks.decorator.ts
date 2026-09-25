import { ADMIN_RESOURCE_STATUSES } from '@modules/admin/shared'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { PaginatedAdminArtistTracksEntity } from '../../entities'

/** Runs the list artist tracks swagger operation. */
export function ListArtistTracksSwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedAdminArtistTracksEntity),
    ApiOperation({ summary: "List an artist's published tracks" }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'status', required: false, enum: ADMIN_RESOURCE_STATUSES }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "A page of the artist's tracks",
      schema: { $ref: getSchemaPath(PaginatedAdminArtistTracksEntity) },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Artist not found' }),
  )
}
