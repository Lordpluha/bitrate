import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { StaffEntity } from '../../entities'

/** Runs the auth me swagger operation. */
export function AuthMeSwagger() {
  return applyDecorators(
    ApiExtraModels(StaffEntity),
    ApiOperation({ summary: 'Get the currently authenticated staff member' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'The authenticated staff member',
      schema: { $ref: getSchemaPath(StaffEntity) },
    }),
  )
}
