import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Mark every unread notification for the caller as read. */
export function ReadAllNotificationsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Mark every one of the caller's notifications as read" }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'All notifications marked read' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
