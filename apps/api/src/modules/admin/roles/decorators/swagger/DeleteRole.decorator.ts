import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { RoleEntity } from '../../entities'

/** Runs the delete role swagger operation. */
export function DeleteRoleSwagger() {
  return applyDecorators(
    ApiExtraModels(RoleEntity),
    ApiOperation({ summary: 'Delete a role template' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(RoleEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'The role is built-in and cannot be deleted',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'The role is still assigned to active operators',
    }),
  )
}
