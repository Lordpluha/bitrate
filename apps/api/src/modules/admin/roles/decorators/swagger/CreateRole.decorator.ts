import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { RoleEntity } from '../../entities'

/** Runs the create role swagger operation. */
export function CreateRoleSwagger() {
  return applyDecorators(
    ApiExtraModels(RoleEntity),
    ApiOperation({ summary: 'Create a role template' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      schema: { $ref: getSchemaPath(RoleEntity) },
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Unknown or protected permission' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Role name already in use' }),
  )
}
