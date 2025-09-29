import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { PlaylistEntity } from '../entities'

export function GetPlaylistsSwagger() {
  return applyDecorators(
    ApiConsumes('application/json'),
    ApiOperation({ summary: 'Get all playlists with pagination and filters' }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number for pagination',
      type: Number
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Number of items per page',
      type: Number
    }),
    ApiResponse({
          status: HttpStatus.OK,
          content: {
            'application/json': {
              example: [
                {
                  cover: 'https://example.com/cover.jpg',
                  createdAt: new Date(),
                  description: 'A cool playlist',
                  id: '1',
                  title: 'My Playlist',
                  userId: 'user-1',
                } as PlaylistEntity,
              ]
            }
          }
        })
  )
}
