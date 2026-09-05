import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiParam } from '@nestjs/swagger'

/** Runs the get artist by username swagger operation. */
export function GetArtistByUsernameSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get artist by username' }),
    ApiParam({ name: 'username', description: 'Artist username', type: 'string' }),
  )
}
