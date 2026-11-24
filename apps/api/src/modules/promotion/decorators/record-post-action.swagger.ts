import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { PostActionDto } from '../dtos'

export function RecordPostActionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Report that a post draft was copied or downloaded',
      description: 'Records a promotion event; nothing is published.',
    }),
    ApiParam({ name: 'releaseId', format: 'uuid' }),
    ApiParam({ name: 'stepId', format: 'uuid' }),
    ApiParam({ name: 'postId', format: 'uuid' }),
    ApiBody({ type: PostActionDto }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Recorded' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Release, step or post not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'The plan was replaced' }),
  )
}
