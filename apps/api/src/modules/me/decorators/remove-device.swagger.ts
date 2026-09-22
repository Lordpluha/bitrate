import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Remove one of the caller's playback devices. */
export function RemoveDeviceSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Remove one of the caller's playback devices" }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Device removed' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Device not found' }),
  )
}
