import { paginatedResponseSchema } from '@common/swagger'
import { PlaylistEntity } from '@modules/playlists/entities'
import { TrackEntity } from '@modules/tracks/entities'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'

const artistIdParam = ApiParam({
  name: 'id',
  type: String,
  format: 'uuid',
  description: 'Artist id',
})

/** Swagger for an artist's most played tracks. */
export function GetArtistTopTracksSwagger() {
  return applyDecorators(
    ApiExtraModels(TrackEntity),
    ApiOperation({
      summary: "An artist's most played tracks, featured credits included",
      description:
        'Ranked by plays in the last 28 days, then all-time plays, then newest release. A play is one listener in one hour.',
    }),
    artistIdParam,
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      minimum: 1,
      maximum: 50,
      example: 10,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { type: 'array', items: { $ref: getSchemaPath(TrackEntity) } },
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'The id is not a UUID' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Artist not found' }),
  )
}

/** Swagger for public playlists featuring an artist. */
export function GetArtistPlaylistsSwagger() {
  return applyDecorators(
    ApiExtraModels(PlaylistEntity),
    ApiOperation({
      summary: "Public playlists that contain the artist's tracks, most followed first",
    }),
    artistIdParam,
    ApiQuery({ name: 'page', required: false, type: Number, minimum: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, minimum: 1, maximum: 100 }),
    ApiResponse({ status: HttpStatus.OK, schema: paginatedResponseSchema(PlaylistEntity) }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'The id is not a UUID' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Artist not found' }),
  )
}
