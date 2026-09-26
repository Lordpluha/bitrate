import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { RoleEntity } from '../../entities'

/** Runs the get role swagger operation. */
export function GetRoleSwagger() {
  return applyDecorators(
    ApiExtraModels(RoleEntity),
    ApiOperation({ summary: 'Get a role by id' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(RoleEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' }),
  )
}
