import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

export function RecordHistorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Record a track listen' }),
    ApiParam({ name: 'trackId', type: 'string', format: 'uuid' }),
    ApiResponse({ status: 201, description: 'Recorded' }),
  )
}
