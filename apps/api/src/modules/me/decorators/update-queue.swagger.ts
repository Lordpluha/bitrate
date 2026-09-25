import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { UpdateQueueDto } from '../dtos'

/** Replace the caller's entire play queue with the given ordered list of track ids. */
export function UpdateQueueSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Replace the caller's play queue",
      description:
        'Deletes the existing queue and recreates it in the given order. All ids must resolve to ready, undeleted tracks.',
    }),
    ApiBody({ type: UpdateQueueDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'The player state with the new queue' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Queue contains unavailable tracks',
    }),
  )
}
