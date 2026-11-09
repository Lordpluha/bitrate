import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { SafeArtistEntity } from '../../entities'

/** Runs the get artist by username swagger operation. */
export function GetArtistByUsernameSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get artist by username' }),
    ApiParam({ name: 'username', description: 'Artist username', type: 'string' }),
    ApiResponse({
      status: HttpStatus.OK,
      type: SafeArtistEntity,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Artist not found',
    }),
  )
}
