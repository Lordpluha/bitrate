import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Runs the unlike album swagger operation. */
export function UnlikeAlbumSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Unlike an album' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Album ID' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Album unliked' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
  )
}
