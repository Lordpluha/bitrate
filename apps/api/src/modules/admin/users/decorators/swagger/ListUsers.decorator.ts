import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { PaginatedAdminUsersEntity } from '../../entities'

/** Runs the list users swagger operation. */
export function ListUsersSwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedAdminUsersEntity),
    ApiOperation({ summary: 'List users' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'q', required: false, type: String, description: 'Search username/email' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of users',
      schema: { $ref: getSchemaPath(PaginatedAdminUsersEntity) },
    }),
  )
}
