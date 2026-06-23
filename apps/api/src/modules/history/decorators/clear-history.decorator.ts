import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

export function ClearHistorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Clear all listening history' }),
    ApiResponse({ status: 204, description: 'History cleared' }),
  )
}
