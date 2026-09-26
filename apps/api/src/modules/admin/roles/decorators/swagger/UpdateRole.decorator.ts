import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { UpdateRoleDto } from '../../dtos'
import { RoleEntity } from '../../entities'

/** Runs the update role swagger operation. */
export function UpdateRoleSwagger() {
  return applyDecorators(
    ApiExtraModels(RoleEntity),
    ApiOperation({ summary: 'Edit a role template' }),
    // Explicit: the controller imports the DTO as a type, so reflection alone names this schema `Function`.
    ApiBody({ type: UpdateRoleDto }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(RoleEntity) } }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Unknown/protected permission, or a built-in role edit that is not allowed',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Role name already in use' }),
  )
}
