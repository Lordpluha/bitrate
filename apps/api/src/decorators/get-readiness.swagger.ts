import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Readiness probe — checks Postgres, Redis and storage, each bounded by a timeout. */
export function GetReadinessSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Readiness probe',
      description:
        'Checks Postgres, Redis and storage in parallel, each bounded by `HEALTH_CHECK_TIMEOUT_MS`. An orchestrator stops routing traffic to this instance while it fails — unlike `/health/live`, this is expected to fail when a dependency is degraded.',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Every dependency is reachable' }),
    ApiResponse({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      description: 'One or more dependencies failed or timed out',
    }),
  )
}
