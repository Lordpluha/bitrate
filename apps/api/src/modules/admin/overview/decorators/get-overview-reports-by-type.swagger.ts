import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { MAX_OVERVIEW_SERIES_DAYS } from '../dtos'
import { AdminOverviewReportsByTypeEntity } from '../entities'

/**
 * Runs the get overview reports-by-type swagger operation. Declares no 403 response —
 * `@RequirePermission` already declares it.
 */
export function GetOverviewReportsByTypeSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminOverviewReportsByTypeEntity),
    ApiOperation({
      summary: 'Get moderation reports filed per day, by entity type',
      description: `Zero-filled daily counts of reports created in a trailing window of UTC calendar days, one series per entity type. Defaults to 30 days, capped at ${MAX_OVERVIEW_SERIES_DAYS}.`,
    }),
    ApiQuery({
      name: 'days',
      required: false,
      type: Number,
      description: `Window size in UTC calendar days. Default 30, max ${MAX_OVERVIEW_SERIES_DAYS}.`,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: getSchemaPath(AdminOverviewReportsByTypeEntity) },
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid or out-of-range `days`' }),
  )
}
