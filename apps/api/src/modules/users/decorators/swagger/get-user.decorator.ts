import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

export function GetUserSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user by id' }),
    ApiConsumes('application/json'),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User retrieved successfully',
      schema: {
        $ref: '#/components/schemas/SafeUserEntity',
      },
    }),
  )
}
