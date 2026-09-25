import { paginatedResponseSchema } from '@common/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { PlaylistDetailEntity, PlaylistEntity } from '../entities'

/** Runs the add tracks to playlist swagger operation. */
export function AddTracksToPlaylistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Add tracks to a playlist' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Playlist ID' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Tracks added',
      type: PlaylistDetailEntity,
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Playlist not found' }),
  )
}

/** Runs the remove track from playlist swagger operation. */
export function RemoveTrackFromPlaylistSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove a track from a playlist' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Playlist ID' }),
    ApiParam({ name: 'trackId', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Track removed',
      type: PlaylistDetailEntity,
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Playlist or track not found' }),
  )
}

/** Runs the get my playlists swagger operation. */
export function GetMyPlaylistsSwagger() {
  return applyDecorators(
    ApiExtraModels(PlaylistEntity),
    ApiOperation({ summary: 'Get playlists owned by the current user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of user playlists',
      schema: paginatedResponseSchema(PlaylistEntity),
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
  )
}
