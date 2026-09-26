import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Revoke every active session for the caller except the one making this request. */
export function AuthRevokeOtherSessionsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Revoke every other session for the caller' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Every other session revoked' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
