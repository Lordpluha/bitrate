import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { UpdatePromotionPostDto } from '../dtos'
import { StepPostsEntity } from '../entities'

export function UpdatePromotionPostSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Edit a draft's English master",
      description:
        'Its translations become STALE; an edited translation keeps its text until the artist replaces it.',
    }),
    ApiParam({ name: 'releaseId', format: 'uuid' }),
    ApiParam({ name: 'stepId', format: 'uuid' }),
    ApiParam({ name: 'postId', format: 'uuid' }),
    ApiBody({ type: UpdatePromotionPostDto }),
    ApiResponse({ status: HttpStatus.OK, type: StepPostsEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Over the channel's length" }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release, step or post not found' }),
  )
}
