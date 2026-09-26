import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { SafeUserEntity } from '../../entities'

/** Runs the get user swagger operation. */
export function GetUserSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user by id' }),
    ApiConsumes('application/json'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User retrieved successfully',
      type: SafeUserEntity,
    }),
  )
}
