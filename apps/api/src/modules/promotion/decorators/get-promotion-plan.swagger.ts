import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { PromotionPlanEntity } from '../entities'

export function GetPromotionPlanSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Read a release's latest promotion plan",
      description: 'Every step is dated from the release date as it is now.',
    }),
    ApiParam({ name: 'releaseId', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, type: PromotionPlanEntity }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release or plan not found' }),
  )
}
