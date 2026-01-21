import { ArtistEntity } from '@modules/artists'
import { UpdateUserDto } from '@modules/users'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

export function PutUserSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update user by id' }),
    ApiConsumes('application/json'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User profile updated successfully',
      example: {
        id: '1',
        username: 'user1',
        avatar: 'https://example.com/uploads/avatars/avatar.jpg',
        backgroundImage: '',
        bio: 'Some bio',
        createdAt: new Date(),
      } as Omit<ArtistEntity, 'password'>,
    }),
    ApiBody({
      description: 'User data to update',
      type: UpdateUserDto,
    }),
  )
}
