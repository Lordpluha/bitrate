import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

export function GetUserByUsernameSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user by username' }),
    ApiConsumes('application/json'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User retrieved successfully',
      schema: {
        $ref: '#/components/schemas/SafeUserEntity',
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'User not found',
    }),
    ApiParam({
      name: 'username',
      required: true,
      description: 'Username of the user to retrieve',
      type: String,
    }),
  )
}
