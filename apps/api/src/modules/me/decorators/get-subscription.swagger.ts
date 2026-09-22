import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Get the caller's active subscription, or a synthetic free-plan record if none exists. */
export function GetSubscriptionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Get the caller's subscription",
      description:
        'Returns the most recent active subscription, or `{ plan: "FREE", status: "ACTIVE" }` when the caller has none.',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'The subscription' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
