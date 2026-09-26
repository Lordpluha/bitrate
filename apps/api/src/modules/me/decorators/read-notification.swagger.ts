import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'

/** Mark one of the caller's notifications as read. */
export function ReadNotificationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Mark a notification as read' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Notification marked read' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification not found' }),
  )
}
