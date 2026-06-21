import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Runs the like playlist swagger operation. */
export function LikePlaylistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Like a playlist' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Playlist ID' }),
    ApiResponse({ status: HttpStatus.CREATED, description: 'Playlist liked' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Playlist not found' }),
  )
}
