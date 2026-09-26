import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { AlbumEntity } from '../entities'

/** Runs the unlike album swagger operation. */
export function UnlikeAlbumSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Unlike an album' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Album ID' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Album unliked', type: AlbumEntity }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
  )
}
