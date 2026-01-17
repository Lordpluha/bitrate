import { TrackEntity } from '@modules/tracks/entities'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

export function TracksGetLikedSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get liked user tracks with pagination' }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Page number',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10,
      description: 'Items per page',
    }),
    ApiConsumes('application/json'),
    ApiResponse({
      status: HttpStatus.OK,
      content: {
        'application/json': {
          example: [
            {
              artist: '123',
              title: 'Track Title',
              id: '1',
              likedBy: [],
              album: 'Album Name',
              albumId: 'album123',
              artistId: 'artist123',
              cover: 'https://example.com/cover.jpg',
              audioUrl: '',
              userId: '',
              createdAt: new Date(),
            } as TrackEntity,
          ],
        },
      },
    }),
  )
}
