import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { StepPostsEntity } from '../entities'

export function RequestStepPostsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Write a POST step's English drafts, one per channel",
      description:
        'Runs in the background and returns the step with status GENERATING. Rewriting existing drafts marks their translations STALE.',
    }),
    ApiParam({ name: 'releaseId', format: 'uuid' }),
    ApiParam({ name: 'stepId', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.ACCEPTED, type: StepPostsEntity }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release or step not found' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Not a POST step, the step was rejected, or drafts are being written',
    }),
    ApiResponse({ status: HttpStatus.PAYMENT_REQUIRED, description: 'Monthly AI allowance used' }),
  )
}
