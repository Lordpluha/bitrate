import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

export function GetPlaylistsSwagger() {
  return applyDecorators(
    ApiConsumes('application/json'),
    ApiOperation({ summary: 'Get all playlists with pagination and filters' }),
    ApiParam({
      name: 'page',
      required: false,
      description: 'Page number for pagination',
      type: Number,
    }),
    ApiParam({
      name: 'limit',
      required: false,
      description: 'Number of items per page',
      type: Number,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/PlaylistEntity',
        },
      },
    }),
  )
}
