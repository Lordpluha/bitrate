import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Liveness probe — confirms the process is up, with no dependency checks. */
export function GetLivenessSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Liveness probe',
      description:
        'Answers immediately with no dependency checks. An orchestrator restarts the container when this stops responding; it never fails because a downstream dependency is down — that is `/health/ready`.',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'The process is up' }),
  )
}
