import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Follow another user. Idempotent — following twice is a no-op. */
export function FollowUserSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Follow a user' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'User id to follow' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Now following the user' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot follow yourself' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
  )
}
