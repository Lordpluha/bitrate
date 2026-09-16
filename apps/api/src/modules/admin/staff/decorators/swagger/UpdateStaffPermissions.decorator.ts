import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { UpdateStaffPermissionsDto } from '../../dtos'
import { AdminStaffEntity } from '../../entities'

/** Runs the update staff permissions swagger operation. */
export function UpdateStaffPermissionsSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminStaffEntity),
    ApiOperation({ summary: "Replace an operator's own permission set" }),
    // Explicit: the controller imports the DTO as a type, so reflection alone names this schema `Function`.
    ApiBody({ type: UpdateStaffPermissionsDto }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminStaffEntity) } }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Unknown/protected permission, or the target holds the built-in ADMIN role',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Operator not found' }),
  )
}
