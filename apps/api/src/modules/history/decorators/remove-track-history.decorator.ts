import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

export function RemoveTrackHistorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove a specific track from history' }),
    ApiParam({ name: 'trackId', type: 'string', format: 'uuid' }),
    ApiResponse({ status: 200, description: 'Track removed from history' }),
  )
}
