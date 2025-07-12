import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger'
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
            password: 'hashed_password'
          } as UserEntity
        }
      }
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized'
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Server error'
    }),
    ApiCookieAuth(process.env.ACCESS_TOKEN_NAME)
  )
}
