import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { ADMIN_TRACKS_SORT_FIELDS, TRACK_PROCESSING_STATUSES } from '../../dtos'
import { PaginatedAdminTracksEntity } from '../../entities'

/** Runs the list tracks swagger operation. */
export function ListTracksSwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedAdminTracksEntity),
    ApiOperation({
      summary: 'List tracks',
      description:
        'Sorted problem-first by default: FAILED, then the longest-stuck PROCESSING rows, then everything else. ' +
        'Passing `sort` replaces that attention-first default with a plain ordering on the chosen field.',
    }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'processingStatus', required: false, enum: TRACK_PROCESSING_STATUSES }),
    ApiQuery({ name: 'q', required: false, type: String, description: 'Search by title' }),
    ApiQuery({ name: 'sort', required: false, enum: ADMIN_TRACKS_SORT_FIELDS }),
    ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of tracks',
      schema: { $ref: getSchemaPath(PaginatedAdminTracksEntity) },
    }),
  )
}
