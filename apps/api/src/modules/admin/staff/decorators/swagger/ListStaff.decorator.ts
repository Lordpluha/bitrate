import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { ADMIN_STAFF_SORT_FIELDS } from '../../dtos'
import { PaginatedAdminStaffEntity } from '../../entities'

/** Runs the list staff swagger operation. */
export function ListStaffSwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedAdminStaffEntity),
    ApiOperation({ summary: 'List operators' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'sort', required: false, enum: ADMIN_STAFF_SORT_FIELDS }),
    ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of operators',
      schema: { $ref: getSchemaPath(PaginatedAdminStaffEntity) },
    }),
  )
}
