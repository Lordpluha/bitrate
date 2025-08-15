import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiQuery
} from '@nestjs/swagger'
import { ArtistEntity } from 'src/artists/entities'

export function GetArtistsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all artists with pagination' }),
    ApiQuery({
      name: 'username',
      required: false,
      type: String,
      description: 'Search by artist username'
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Page number'
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10,
      description: 'Items per page'
    }),
    ApiConsumes('application/json'),
    ApiResponse({
      status: HttpStatus.OK,
      content: {
        'application/json': {
          example: [
            {
              avatar: 'https://example.com/avatar.jpg',
              id: '1',
              username: 'artist1',
              backgroundImage: '',
              bio: ''
            } as Omit<ArtistEntity, 'password' | 'email'>
          ]
        }
      }
    })
  )
}
