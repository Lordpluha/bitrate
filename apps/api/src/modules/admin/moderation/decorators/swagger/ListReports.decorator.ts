import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { ADMIN_REPORTS_SORT_FIELDS, MODERATION_STATUSES } from '../../dtos'
import { PaginatedReportsEntity } from '../../entities'

/** Runs the list reports swagger operation. */
export function ListReportsSwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedReportsEntity),
    ApiOperation({ summary: 'List moderation reports' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'status', required: false, enum: MODERATION_STATUSES }),
    ApiQuery({ name: 'sort', required: false, enum: ADMIN_REPORTS_SORT_FIELDS }),
    ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of moderation reports',
      schema: { $ref: getSchemaPath(PaginatedReportsEntity) },
    }),
  )
}
