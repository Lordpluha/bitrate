import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminStaffEntity } from '../../entities'

/** Runs the update staff permissions swagger operation. */
export function UpdateStaffPermissionsSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminStaffEntity),
    ApiOperation({ summary: "Replace an operator's own permission set" }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminStaffEntity) } }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Unknown/protected permission, or the target holds the built-in ADMIN role',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Operator not found' }),
  )
}
