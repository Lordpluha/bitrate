import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** List the caller's search history, most recent first. */
export function GetSearchHistorySwagger() {
  return applyDecorators(
    ApiOperation({ summary: "List the caller's search history" }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of past searches, most recent first',
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
