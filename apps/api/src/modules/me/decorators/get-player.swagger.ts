import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Get the caller's live player state — current track, device, and ordered queue. */
export function GetPlayerSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Get the caller's player state",
      description: 'Includes the active device, the current track, and the ordered queue.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'The player state, or null if none exists yet',
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
