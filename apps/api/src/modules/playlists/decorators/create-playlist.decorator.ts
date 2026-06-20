import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

export function CreatePlaylistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new playlist' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Playlist created',
      schema: { $ref: '#/components/schemas/PlaylistEntity' },
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
  )
}
