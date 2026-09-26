import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Save an episode to the caller's library. Idempotent — saving twice is a no-op. */
export function SaveEpisodeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Save an episode to the caller's library" }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Episode id' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Episode saved' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Episode not found' }),
  )
}
