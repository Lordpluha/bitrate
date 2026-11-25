import { SupportInboxConversationEntity } from '@modules/support'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'

/** Swagger for one handed-off conversation with its history. */
export function GetSupportConversationSwagger() {
  return applyDecorators(
    ApiExtraModels(SupportInboxConversationEntity),
    ApiOperation({ summary: 'Get a handed-off support conversation with its whole history' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: getSchemaPath(SupportInboxConversationEntity) },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No handed-off conversation' }),
  )
}
