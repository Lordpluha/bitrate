import { applyDecorators } from '@nestjs/common'
import { ApiBadRequestResponse, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { MAX_ALBUM_LOOKUP_TRACKS } from '../dtos'

/** Swagger for the album of each track in a track list. */
export function GetAlbumsForTracksSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get the album of each track in a list',
      description:
        'One entry per requested track, in request order. A track on several albums is shown on its earliest; a single or a deleted album answers null.',
    }),
    ApiQuery({
      name: 'trackIds',
      required: true,
      type: String,
      description: `Comma-separated track ids, 1 to ${MAX_ALBUM_LOOKUP_TRACKS}`,
    }),
    ApiResponse({
      status: 200,
      schema: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              required: ['trackId', 'album'],
              properties: {
                trackId: { type: 'string', format: 'uuid' },
                album: {
                  type: 'object',
                  nullable: true,
                  required: ['id', 'title'],
                  properties: { id: { type: 'string', format: 'uuid' }, title: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({ description: 'trackIds is missing, malformed or longer than allowed' }),
  )
}
