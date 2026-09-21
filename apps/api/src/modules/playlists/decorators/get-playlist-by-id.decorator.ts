import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { PlaylistDetailEntity } from '../entities'

/** Runs the get playlist by id swagger operation. */
export function GetPlaylistByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get playlist by id' }),
    ApiParam({ name: 'id', description: 'Playlist id', type: 'string', format: 'uuid' }),
    ApiResponse({
      status: HttpStatus.OK,
      type: PlaylistDetailEntity,
    }),
  )
}
