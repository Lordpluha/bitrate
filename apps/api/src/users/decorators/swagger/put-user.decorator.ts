import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiBody
} from '@nestjs/swagger'
import { ArtistEntity } from 'src/artists/entities'
import { UpdateUserDto } from 'src/users/dtos'

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
        createdAt: new Date()
      } as Omit<ArtistEntity, 'password'>
    }),
    ApiBody({
      description: 'User data to update',
      type: UpdateUserDto
    })
  )
}
