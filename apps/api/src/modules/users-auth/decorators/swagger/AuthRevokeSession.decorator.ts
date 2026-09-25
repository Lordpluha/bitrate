import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Revokes one session owned by the caller, signing it out immediately. */
export function AuthRevokeSessionSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Revoke one of the caller’s sessions' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Session revoked' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Session not found, or does not belong to the caller',
    }),
  )
}
