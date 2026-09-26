import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { PaginatedAdminTrackProcessingAttemptsEntity } from '../../entities'

/** Runs the list track processing attempts swagger operation. */
export function ListTrackProcessingAttemptsSwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedAdminTrackProcessingAttemptsEntity),
    ApiOperation({
      summary: "List a track's processing attempt history",
      description: 'Newest first. Soft-deleted tracks are still reachable.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "A page of the track's processing attempts",
      schema: { $ref: getSchemaPath(PaginatedAdminTrackProcessingAttemptsEntity) },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Track not found' }),
  )
}
