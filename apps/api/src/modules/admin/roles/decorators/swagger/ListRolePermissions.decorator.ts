import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { RolePermissionEntity } from '../../entities'

/** Runs the list role permissions swagger operation. */
export function ListRolePermissionsSwagger() {
  return applyDecorators(
    ApiExtraModels(RolePermissionEntity),
    ApiOperation({ summary: 'List the permission catalogue' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Every permission, with how many active operators hold it',
      schema: { type: 'array', items: { $ref: getSchemaPath(RolePermissionEntity) } },
    }),
  )
}
