import { paginatedResponseSchema } from '@common/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { PlaylistEntity } from '../entities'

/** Runs the get playlists swagger operation. */
export function GetPlaylistsSwagger() {
  return applyDecorators(
    ApiConsumes('application/json'),
    ApiOperation({ summary: 'Get all playlists with pagination and filters' }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number for pagination',
      type: Number,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Number of items per page',
      type: Number,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: paginatedResponseSchema(PlaylistEntity),
    }),
  )
}
