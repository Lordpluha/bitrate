import { SupportInboxConversationEntity } from '@modules/support'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { ReplySupportConversationDto } from '../../dtos'

/** Swagger for an operator reply. */
export function ReplySupportConversationSwagger() {
  return applyDecorators(
    ApiExtraModels(SupportInboxConversationEntity),
    ApiOperation({
      summary: 'Reply as an operator; the conversation stays with operators until resolved',
    }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: ReplySupportConversationDto }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: getSchemaPath(SupportInboxConversationEntity) },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No handed-off conversation' }),
  )
}
