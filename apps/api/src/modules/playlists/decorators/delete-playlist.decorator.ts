import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { PlaylistEntity } from '../entities'

/** Runs the delete playlist swagger operation. */
export function DeletePlaylistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a playlist' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Playlist ID' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Playlist deleted', type: PlaylistEntity }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Playlist not found or not owned by user',
    }),
  )
}
