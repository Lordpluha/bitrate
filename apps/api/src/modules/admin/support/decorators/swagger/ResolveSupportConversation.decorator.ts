import { SupportInboxConversationEntity } from '@modules/support'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'

/** Swagger for resolving a ticket. */
export function ResolveSupportConversationSwagger() {
  return applyDecorators(
    ApiExtraModels(SupportInboxConversationEntity),
    ApiOperation({
      summary: "Resolve the ticket; the assistant answers the user's next message again",
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: getSchemaPath(SupportInboxConversationEntity) },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No handed-off conversation' }),
  )
}
