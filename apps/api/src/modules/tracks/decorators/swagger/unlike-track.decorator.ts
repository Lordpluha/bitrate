import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

export function UnlikeTrackSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Unlike a track' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Track ID' }),
    ApiResponse({ status: HttpStatus.OK, description: 'Track unliked' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
  )
}
