import { paginatedResponseSchema } from '@common/swagger'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { SafeUserEntity } from '../../entities'

/** Runs the get users swagger operation. */
export function GetUsersSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all users with filters and pagination' }),
    ApiConsumes('application/json'),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Number of users to return per page',
      type: Number,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number for pagination',
      type: Number,
    }),
    ApiQuery({
      name: 'username',
      required: false,
      description: 'Filter users by username',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of users retrieved successfully',
      schema: paginatedResponseSchema(SafeUserEntity),
    }),
  )
}
