import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { RoleEntity } from '../../entities'

/** Runs the list roles swagger operation. */
export function ListRolesSwagger() {
  return applyDecorators(
    ApiExtraModels(RoleEntity),
    ApiOperation({ summary: 'List role templates' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Every role, with operator counts',
      schema: { type: 'array', items: { $ref: getSchemaPath(RoleEntity) } },
    }),
  )
}
