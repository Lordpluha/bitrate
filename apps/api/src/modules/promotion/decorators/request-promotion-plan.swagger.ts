import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { PromotionPlanEntity } from '../entities'

export function RequestPromotionPlanSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Generate a new promotion plan version for a release',
      description:
        'Starts generation in the background and returns the new GENERATING version. Steps the artist approved, edited or finished are kept; suggested ones are replaced.',
    }),
    ApiParam({ name: 'releaseId', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.ACCEPTED, type: PromotionPlanEntity }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release not found' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'No release date, no profile, or a version is already generating',
    }),
    ApiResponse({ status: HttpStatus.PAYMENT_REQUIRED, description: 'Monthly AI allowance used' }),
  )
}
