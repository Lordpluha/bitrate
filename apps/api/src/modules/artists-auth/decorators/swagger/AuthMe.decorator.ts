import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

export function AuthMeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get current authenticated user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Successfully logged out',
      schema: {
        $ref: '#/components/schemas/SafeUserEntity',
      },
    }),
  )
}
