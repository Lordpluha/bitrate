import { TakeDownReasonDto } from '@modules/admin/shared'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { AdminUserEntity } from '../../entities'

/** Runs the delete user swagger operation. */
export function DeleteUserSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminUserEntity),
    ApiOperation({ summary: 'Soft-delete (deactivate) a user' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiBody({ type: TakeDownReasonDto, required: false }),
    ApiResponse({ status: HttpStatus.OK, schema: { $ref: getSchemaPath(AdminUserEntity) } }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Requires the ADMIN role' }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'User is already deleted' }),
  )
}
