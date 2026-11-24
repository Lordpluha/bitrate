import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { UpdatePromotionStepDto } from '../dtos'
import { PromotionPlanEntity } from '../entities'

export function UpdatePromotionStepSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Approve, edit, reject or finish a promotion step',
      description:
        'Only steps of the latest version change. Editing marks the step as written by the artist.',
    }),
    ApiParam({ name: 'releaseId', format: 'uuid' }),
    ApiParam({ name: 'stepId', format: 'uuid' }),
    ApiBody({ type: UpdatePromotionStepDto }),
    ApiResponse({ status: HttpStatus.OK, type: PromotionPlanEntity }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release or step not found' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'The step changed, the action does not apply, or the plan was replaced',
    }),
  )
}
