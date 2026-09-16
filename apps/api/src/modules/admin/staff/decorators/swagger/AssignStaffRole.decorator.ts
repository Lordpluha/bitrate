import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminStaffEntity } from '../../entities'

/** Runs the assign staff role swagger operation. */
export function AssignStaffRoleSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminStaffEntity),
    ApiOperation({ summary: "Reassign an operator's role" }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminStaffEntity) } }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Unknown or protected permission' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Operator or role not found' }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'This would leave no active operator holding the ADMIN role',
    }),
  )
}
