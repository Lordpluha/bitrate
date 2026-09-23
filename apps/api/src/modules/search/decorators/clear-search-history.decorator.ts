import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Delete the caller's entire search history. */
export function ClearSearchHistorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Clear the caller's search history" }),
    ApiResponse({ status: HttpStatus.OK, description: 'Search history cleared' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
