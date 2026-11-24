import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import { SupportConversationEntity } from '../entities/support-conversation.entity'
import { SUPPORT_TOKEN_HEADER } from '../guest-token'

export function GetSupportConversationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Read a support conversation with its messages' }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiHeader({ name: SUPPORT_TOKEN_HEADER, required: false, description: 'Guest token' }),
    ApiResponse({ status: HttpStatus.OK, type: SupportConversationEntity }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Missing, or not the caller’s' }),
  )
}
