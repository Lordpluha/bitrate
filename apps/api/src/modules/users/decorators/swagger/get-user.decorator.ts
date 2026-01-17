import { ArtistEntity } from '@modules/artists'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

export function GetUserSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user by id' }),
    ApiConsumes('application/json'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User retrieved successfully',
      example: {
        id: '1',
        username: 'user1',
        avatar: 'https://example.com/uploads/avatars/avatar.jpg',
        backgroundImage: '',
        bio: 'Some bio',
        createdAt: new Date(),
      } as Omit<ArtistEntity, 'password'>,
    }),
  )
}
