import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { PaginatedAdminListeningHistoryEntity } from '../../entities'

/** Runs the list listening history swagger operation. */
export function ListListeningHistorySwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedAdminListeningHistoryEntity),
    ApiOperation({ summary: "List a user's listening history, newest first" }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "A page of the user's listening history",
      schema: { $ref: getSchemaPath(PaginatedAdminListeningHistoryEntity) },
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
  )
}
