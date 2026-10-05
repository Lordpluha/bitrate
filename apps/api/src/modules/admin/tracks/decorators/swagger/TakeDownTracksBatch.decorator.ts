import { AdminBatchResultEntity, BatchIdsDto } from '@modules/admin/shared'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Runs the take down many tracks swagger operation. */
export function TakeDownTracksBatchSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Take down many tracks',
      description:
        'Each id is processed independently with the single-entity rules. Always 200 with a per-id result; failed ids carry an error code and message. Requires tracks:delete.',
    }),
    ApiBody({ type: BatchIdsDto }),
    ApiResponse({ status: HttpStatus.OK, type: AdminBatchResultEntity }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Empty, malformed or over-100 id list',
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Missing tracks:delete' }),
  )
}
