import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { CreateSupportConversationDto } from '../dtos/create-support-conversation.dto'
import { SupportConversationCreatedEntity } from '../entities/support-conversation-created.entity'

export function CreateSupportConversationSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Start a support conversation',
      description:
        'Works for guests and signed-in listeners. A guest receives a token, shown once, that opens the conversation later through the `x-support-token` header.',
    }),
    ApiBody({ type: CreateSupportConversationDto }),
    ApiResponse({ status: HttpStatus.CREATED, type: SupportConversationCreatedEntity }),
    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: 'Too many new conversations',
    }),
  )
}
