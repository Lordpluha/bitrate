import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { ArtistEntity } from 'src/artists/entities'

export function GetUsersSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all users with filters and pagination' }),
    ApiConsumes('application/json'),
    ApiParam({
      name: 'limit',
      required: false,
      description: 'Number of users to return per page',
      type: Number,
    }),
    ApiParam({
      name: 'page',
      required: false,
      description: 'Page number for pagination',
      type: Number,
    }),
    ApiParam({
      name: 'username',
      required: false,
      description: 'Filter users by username',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of users retrieved successfully',
      example: [
        {
          id: '1',
          username: 'user1',
          avatar: 'https://example.com/uploads/avatars/avatar.jpg',
          backgroundImage: '',
          bio: 'Some bio',
          createdAt: new Date(),
        },
        {
          id: '2',
          username: 'user2',
          avatar: 'https://example.com/uploads/avatars/avatar.jpg',
          backgroundImage: '',
          bio: 'Some bio 2',
          createdAt: new Date(),
        },
      ] as Omit<ArtistEntity, 'password'>[],
    }),
  )
}
