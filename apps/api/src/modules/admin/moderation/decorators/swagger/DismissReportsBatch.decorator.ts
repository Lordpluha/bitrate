import { AdminBatchResultEntity, BatchIdsDto } from '@modules/admin/shared'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Runs the dismiss many moderation reports swagger operation. */
export function DismissReportsBatchSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Dismiss many moderation reports',
      description:
        'Each id is processed independently with the single-entity rules. Always 200 with a per-id result; failed ids carry an error code and message. Requires reports:advance.',
    }),
    ApiBody({ type: BatchIdsDto }),
    ApiResponse({ status: HttpStatus.OK, type: AdminBatchResultEntity }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Empty, malformed or over-100 id list',
    }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Missing reports:advance' }),
  )
}
