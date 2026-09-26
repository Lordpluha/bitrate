import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** List the users the caller follows, most recently followed first. */
export function GetFollowingSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'List the users the caller follows' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({ status: HttpStatus.OK, description: 'A page of followed users' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
