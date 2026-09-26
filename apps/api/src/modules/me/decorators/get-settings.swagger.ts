import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Get the current user's playback and privacy settings, creating defaults on first read. */
export function GetSettingsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Get the caller's settings",
      description:
        'Returns the settings row for the authenticated user, creating it with defaults on first read.',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'The settings row' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
