import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiCookieAuth
} from '@nestjs/swagger'
import { TrackEntity } from 'src/tracks/entities'

export function PostTrackSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create track' }),
    ApiConsumes('application/json'),
    ApiCookieAuth(process.env.ACCESS_TOKEN_NAME),
    ApiResponse({
      status: HttpStatus.CREATED,
      content: {
        'application/json': {
          example: {
            id: '1',
            title: 'Track Title',
            cover: 'https://example.com/cover.jpg',
            audioUrl: '',
            createdAt: new Date()
          } as Omit<TrackEntity, 'artistId'>
        }
      }
    })
  )
}
