import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

export function GetHistorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get listening history (deduplicated, most recent first)' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 20 }),
    ApiResponse({ status: 200, description: 'History entries with track info' }),
  )
}
