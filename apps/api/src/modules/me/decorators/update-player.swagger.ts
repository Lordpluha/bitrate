import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { UpdatePlayerDto } from '../dtos'

/** Update the caller's player state (device, current track, position, playback flags). */
export function UpdatePlayerSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Update the caller's player state",
      description:
        'Upserts the player state row. `deviceId` must belong to the caller and `currentTrackId` must be a ready track.',
    }),
    ApiBody({ type: UpdatePlayerDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'The updated player state' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Device does not belong to the caller, or track is not ready for playback',
    }),
  )
}
