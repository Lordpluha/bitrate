import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminUserDetailEntity } from '../../entities'

/** Runs the get user swagger operation. */
export function GetUserSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminUserDetailEntity),
    ApiOperation({ summary: 'Get a user by id, including activity counts' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminUserDetailEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
  )
}
