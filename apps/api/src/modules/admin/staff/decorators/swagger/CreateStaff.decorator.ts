import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiExtraModels, ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { CreateStaffDto } from '../../dtos'
import { AdminStaffEntity } from '../../entities'

/** Runs the create staff swagger operation. */
export function CreateStaffSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminStaffEntity),
    ApiOperation({ summary: 'Create an operator' }),
    // Explicit: the controller imports the DTO as a type, so reflection alone names this schema `Function`.
    ApiBody({ type: CreateStaffDto }),
    ApiResponse({ status: HttpStatus.CREATED, schema: { $ref: getSchemaPath(AdminStaffEntity) } }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Unknown or protected permission' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email or username already in use' }),
  )
}
