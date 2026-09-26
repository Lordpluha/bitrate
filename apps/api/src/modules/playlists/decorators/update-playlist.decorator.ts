import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { UpdatePlaylistDto } from '../dtos/update-playlist.dto'
import { PlaylistEntity } from '../entities'

/** Runs the update playlist swagger operation. */
export function UpdatePlaylistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update playlist by id' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Playlist ID' }),
    ApiBody({ type: UpdatePlaylistDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Playlist updated',
      type: PlaylistEntity,
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Playlist not found' }),
  )
}
