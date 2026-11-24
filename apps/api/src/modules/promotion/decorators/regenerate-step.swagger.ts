import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { RegenerateStepDto } from '../dtos'
import { PromotionPlanEntity } from '../entities'

export function RegenerateStepSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Ask for a new suggestion for one promotion step',
      description:
        'Only a suggested step of the latest version. The step is marked `regenerating` until ' +
        'the job finishes; on failure the old text stays and `regenerationFailure` says why.',
    }),
    ApiParam({ name: 'releaseId', format: 'uuid' }),
    ApiParam({ name: 'stepId', format: 'uuid' }),
    ApiBody({ type: RegenerateStepDto }),
    ApiResponse({ status: HttpStatus.ACCEPTED, type: PromotionPlanEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'The hint has contact details' }),
    ApiResponse({ status: HttpStatus.PAYMENT_REQUIRED, description: 'Monthly AI allowance used' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release or step not found' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'The step was acted on, is already regenerating, or the plan was replaced',
    }),
  )
}
