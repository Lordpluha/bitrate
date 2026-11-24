import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { StepPostsEntity } from '../entities'

export function GetStepPostsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Read a promotion step's drafts and their translations" }),
    ApiParam({ name: 'releaseId', format: 'uuid' }),
    ApiParam({ name: 'stepId', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, type: StepPostsEntity }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release or step not found' }),
  )
}
