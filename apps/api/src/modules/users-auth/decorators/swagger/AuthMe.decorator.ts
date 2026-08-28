import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Runs the auth me swagger operation. */
export function AuthMeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get current authenticated user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'The signed-in account, including its own email and two-factor state',
      schema: {
        $ref: '#/components/schemas/SelfUserEntity',
      },
    }),
  )
}
