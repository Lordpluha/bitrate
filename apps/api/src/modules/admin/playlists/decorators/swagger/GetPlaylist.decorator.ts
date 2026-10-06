import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminPlaylistDetailEntity } from '../../entities'

/** Runs the get playlist swagger operation. */
export function GetPlaylistSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminPlaylistDetailEntity),
    ApiOperation({
      summary: 'Get a playlist by id, including its owner and first 50 tracks',
      description:
        'Not restricted to public playlists: a hidden or taken-down playlist stays reachable ' +
        'so it can be reviewed and reversed.',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: getSchemaPath(AdminPlaylistDetailEntity) },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Playlist not found' }),
  )
}
