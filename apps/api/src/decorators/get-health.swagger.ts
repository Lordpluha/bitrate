import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Combined health check — alias for the readiness check. */
export function GetHealthSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Combined health check',
      description: 'Alias for `/health/ready`. Prefer `/health/live` or `/health/ready` directly.',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'All dependencies are reachable' }),
    ApiResponse({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      description: 'One or more dependencies (Postgres, Redis, storage) failed or timed out',
    }),
  )
}
