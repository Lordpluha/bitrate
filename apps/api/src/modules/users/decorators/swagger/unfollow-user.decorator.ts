import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Unfollow a user. */
export function UnfollowUserSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Unfollow a user' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'User id to unfollow' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'No longer following the user' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
