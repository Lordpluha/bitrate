import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiCookieAuth
} from '@nestjs/swagger'
import { ArtistEntity } from 'src/artists/entities'

export function UploadAvatarSwagger() {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Avatar uploaded successfully',
      example: {
        'application/json': {
          id: '1',
          username: 'user1',
          avatar: 'https://example.com/uploads/avatars/avatar.jpg',
          backgroundImage: '',
          bio: 'Some bio',
          createdAt: new Date(),
          email: 'example@gmail.com'
        } as Omit<ArtistEntity, 'password'>
      }
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: 'Invalid file type or size'
    }),
    ApiConsumes('multipart/form-data'),
    ApiOperation({ summary: 'Upload avatar for user' }),
    ApiCookieAuth(process.env.ACCESS_TOKEN_NAME)
  )
}
