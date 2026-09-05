import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** Runs the tracks get liked swagger operation. */
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
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              updatedAt: new Date('2026-01-01T00:00:00.000Z'),
              duration: 180,
              releaseDate: new Date('2023-10-01T12:00:00.000Z'),
              lyrics: null,
              processingStatus: 'READY',
              processingError: null,
              processingAttempts: 1,
              processingStartedAt: new Date('2026-01-01T00:00:00.000Z'),
              processingFinishedAt: new Date('2026-01-01T00:00:00.000Z'),
            },
          ],
        },
      },
    }),
  )
}
