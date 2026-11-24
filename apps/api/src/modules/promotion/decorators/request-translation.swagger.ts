import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { RequestTranslationDto } from '../dtos'
import { StepPostsEntity } from '../entities'

export function RequestTranslationSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Translate a draft into Ukrainian or Polish',
      description:
        'Runs in the background. Names, links and hashtags stay as they are. Replaces an existing translation of that language, including an edited one.',
    }),
    ApiParam({ name: 'releaseId', format: 'uuid' }),
    ApiParam({ name: 'stepId', format: 'uuid' }),
    ApiParam({ name: 'postId', format: 'uuid' }),
    ApiBody({ type: RequestTranslationDto }),
    ApiResponse({ status: HttpStatus.ACCEPTED, type: StepPostsEntity }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release, step or post not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Already translating' }),
    ApiResponse({ status: HttpStatus.PAYMENT_REQUIRED, description: 'Monthly AI allowance used' }),
  )
}
