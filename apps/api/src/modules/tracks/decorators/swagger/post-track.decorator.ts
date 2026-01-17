import { TrackEntity } from '@modules/tracks'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

export function PostTrackSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create track' }),
    ApiConsumes('application/json'),
    ApiResponse({
      status: HttpStatus.CREATED,
      content: {
        'application/json': {
          example: {
            id: '1',
            title: 'Track Title',
            cover: 'https://example.com/cover.jpg',
            audioUrl: '',
            createdAt: new Date(),
          } as Omit<TrackEntity, 'artistId'>,
        },
      },
    }),
  )
}
