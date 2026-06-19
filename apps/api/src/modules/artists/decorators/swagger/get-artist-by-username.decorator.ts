import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiParam } from '@nestjs/swagger'

export function GetArtistByUsernameSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get artist by username' }),
    ApiParam({ name: 'username', description: 'Artist username', type: 'string' }),
  )
}
