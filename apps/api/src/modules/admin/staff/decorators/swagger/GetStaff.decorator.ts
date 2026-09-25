import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiParam, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { AdminStaffEntity } from '../../entities'

/** Runs the get staff swagger operation. */
export function GetStaffSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminStaffEntity),
    ApiOperation({ summary: 'Get an operator by id' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminStaffEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Operator not found' }),
  )
}
