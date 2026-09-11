import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminUserEntity } from '../../entities'

/** Runs the get user swagger operation. */
export function GetUserSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminUserEntity),
    ApiOperation({ summary: 'Get a user by id' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminUserEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
  )
}
