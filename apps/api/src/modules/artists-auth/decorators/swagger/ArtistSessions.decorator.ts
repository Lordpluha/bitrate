import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { ArtistSessionDeviceEntity, RevokedArtistSessionsEntity } from '../../entities'

export function ListArtistSessionsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'List the devices signed in to this artist account',
      description: 'Unexpired sessions, most recently used first; the requesting one is marked.',
    }),
    ApiResponse({ status: HttpStatus.OK, type: [ArtistSessionDeviceEntity] }),
  )
}

export function RevokeArtistSessionSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Sign out one other device' }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'The device was signed out' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No such session on this account' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'The session is the one making this request; use logout instead',
    }),
  )
}

export function RevokeOtherArtistSessionsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Sign out every device except this one' }),
    ApiResponse({ status: HttpStatus.OK, type: RevokedArtistSessionsEntity }),
  )
}
