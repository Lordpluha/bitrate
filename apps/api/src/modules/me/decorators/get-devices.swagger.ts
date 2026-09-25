import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** List the caller's registered playback devices, active first, most recently seen first. */
export function GetDevicesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "List the caller's playback devices" }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Devices ordered active-first, then by last seen',
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
