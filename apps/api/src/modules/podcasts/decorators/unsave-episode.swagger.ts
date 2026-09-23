import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Remove an episode from the caller's saved library. */
export function UnsaveEpisodeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Remove an episode from the caller's library" }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Episode id' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Episode removed from the library' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
