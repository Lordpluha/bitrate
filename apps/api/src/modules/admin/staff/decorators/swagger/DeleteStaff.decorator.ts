import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminStaffEntity } from '../../entities'

/** Runs the delete staff swagger operation. */
export function DeleteStaffSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminStaffEntity),
    ApiOperation({ summary: 'Deactivate an operator and revoke its sessions' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminStaffEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Operator not found' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'This would leave no active operator holding the ADMIN role',
    }),
  )
}
