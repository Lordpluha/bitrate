import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Runs the unlike playlist swagger operation. */
export function UnlikePlaylistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Unlike a playlist' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Playlist ID' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Playlist unliked' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
  )
}
