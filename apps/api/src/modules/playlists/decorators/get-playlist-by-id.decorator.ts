import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Runs the get playlist by id swagger operation. */
export function GetPlaylistByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get playlist by id' }),
    ApiParam({ name: 'id', description: 'Playlist id', type: 'string', format: 'uuid' }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: {
        allOf: [
          { $ref: '#/components/schemas/PlaylistEntity' },
          {
            type: 'object',
            properties: {
              tracks: {
                type: 'array',
                items: { $ref: '#/components/schemas/TrackEntity' },
              },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  avatar: { type: 'string', nullable: true },
                },
              },
            },
          },
        ],
      },
    }),
  )
}
