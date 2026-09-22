import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Lists the caller's active, unexpired sessions, without exposing token hashes. */
export function AuthGetSessionsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "List the caller's active sessions",
      description: 'Each session carries a `current` flag marking the session making this request.',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Active sessions, most recent first' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
