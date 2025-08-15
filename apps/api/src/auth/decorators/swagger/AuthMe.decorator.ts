import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { UserEntity } from 'src/users/entities'

export function AuthMeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get current authenticated user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successfully logged out',
      content: {
        'application/json': {
          example: {
            createdAt: new Date('2023-10-01T12:00:00.000Z'),
            email: 'user@example.com',
            id: '1234567890abcdef',
            updatedAt: '2023-10-01T12:00:00.000Z',
            username: 'user123',
            avatar: null,
            description: 'Some description about the user'
          } as Omit<UserEntity, 'password'>
        }
      }
    })
  )
}
