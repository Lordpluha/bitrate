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
    ApiQuery({
      name: 'userId',
      required: false,
      type: String,
      format: 'uuid',
      description: "Only this user's public playlists (a profile page)",
    }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: paginatedResponseSchema(PlaylistEntity),
    }),
  )
}

/** Swagger for the playlists the signed-in user liked. */
export function GetLikedPlaylistsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get the playlists the signed-in user liked, newest like first' }),
    ApiQuery({ name: 'page', required: false, type: Number, minimum: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, minimum: 1, maximum: 100 }),
    ApiResponse({ status: HttpStatus.OK, schema: paginatedResponseSchema(PlaylistEntity) }),
  )
}
