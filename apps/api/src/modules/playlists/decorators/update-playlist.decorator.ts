import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

export function UpdatePlaylistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update playlist by id' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Playlist ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Playlist updated',
      schema: { $ref: '#/components/schemas/PlaylistEntity' },
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Playlist not found' }),
  )
}
