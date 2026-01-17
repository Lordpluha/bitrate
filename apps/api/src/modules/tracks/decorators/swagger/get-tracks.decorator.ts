import { TrackEntity } from '@modules/tracks'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

export function TracksGetAllSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all tracks with pagination' }),
    ApiQuery({
      name: 'title',
      required: false,
      type: String,
      description: 'Search by track title',
    }),
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
              updatedAt: new Date(),
              duration: 180,
              releaseDate: new Date('2023-10-01T12:00:00.000Z'),
              lyrics: null,
            } as TrackEntity,
          ],
        },
      },
    }),
  )
}
