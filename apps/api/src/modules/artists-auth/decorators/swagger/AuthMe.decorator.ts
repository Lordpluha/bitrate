import { SafeArtistEntity } from '@modules/artists'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Runs the auth me swagger operation. */
export function AuthMeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get current authenticated artist' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'The signed-in artist account',
      type: SafeArtistEntity,
    }),
  )
}
