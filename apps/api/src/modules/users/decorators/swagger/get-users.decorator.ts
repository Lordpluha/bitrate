import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

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
      schema: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/SafeUserEntity',
        },
      },
    }),
  )
}
