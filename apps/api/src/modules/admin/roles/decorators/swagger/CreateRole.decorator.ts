import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiExtraModels, ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { CreateRoleDto } from '../../dtos'
import { RoleEntity } from '../../entities'

/** Runs the create role swagger operation. */
export function CreateRoleSwagger() {
  return applyDecorators(
    ApiExtraModels(RoleEntity),
    ApiOperation({ summary: 'Create a role template' }),
    // Explicit: the controller imports the DTO as a type, so reflection alone names this schema `Function`.
    ApiBody({ type: CreateRoleDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      schema: { $ref: getSchemaPath(RoleEntity) },
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Unknown or protected permission' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Role name already in use' }),
  )
}
