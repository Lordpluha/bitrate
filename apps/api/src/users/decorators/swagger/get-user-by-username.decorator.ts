import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiParam
} from '@nestjs/swagger'
import { ArtistEntity } from 'src/artists/entities'

export function GetUserByUsernameSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user by username' }),
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
        createdAt: new Date()
      } as Omit<ArtistEntity, 'password'>
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found'
    }),
    ApiParam({
      name: 'username',
      required: true,
      description: 'Username of the user to retrieve',
      type: String
    })
  )
}
