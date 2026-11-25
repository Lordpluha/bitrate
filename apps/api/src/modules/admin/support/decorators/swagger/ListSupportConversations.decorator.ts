import {
  PaginatedSupportInboxEntity,
  SUPPORT_AUDIENCES,
  SUPPORT_CHANNELS,
  SUPPORT_TICKET_STATUSES,
} from '@modules/support'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger'

/** Swagger for the operator inbox list. */
export function ListSupportConversationsSwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedSupportInboxEntity),
    ApiOperation({ summary: 'List conversations handed to an operator, newest activity first' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'status', required: false, enum: SUPPORT_TICKET_STATUSES }),
    ApiQuery({ name: 'channel', required: false, enum: SUPPORT_CHANNELS }),
    ApiQuery({ name: 'audience', required: false, enum: SUPPORT_AUDIENCES }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: getSchemaPath(PaginatedSupportInboxEntity) },
    }),
  )
}
