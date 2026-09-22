import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** Get the caller's notifications, paginated newest first, with a total unread count. */
export function GetNotificationsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "List the caller's notifications" }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of notifications newest-first, plus the total unread count',
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
