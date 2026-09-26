import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { MAX_OVERVIEW_SERIES_DAYS } from '../dtos'
import { AdminOverviewSeriesEntity } from '../entities'

/**
 * Runs the get overview series swagger operation. Declares no 403 response — `@RequirePermission`
 * already declares it, and a method-level `ApiResponse` for the same status would replace that
 * one rather than merge with it (see `RequirePermission`'s own TSDoc).
 */
export function GetOverviewSeriesSwagger() {
  return applyDecorators(
    ApiExtraModels(AdminOverviewSeriesEntity),
    ApiOperation({
      summary: "Get the operator dashboard's daily time series",
      description: `Zero-filled daily series over a trailing window of UTC calendar days, defaulting to 30 and capped at ${MAX_OVERVIEW_SERIES_DAYS}.`,
    }),
    ApiQuery({
      name: 'days',
      required: false,
      type: Number,
      description: `Window size in UTC calendar days. Default 30, max ${MAX_OVERVIEW_SERIES_DAYS}.`,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      schema: { $ref: getSchemaPath(AdminOverviewSeriesEntity) },
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid or out-of-range `days`' }),
  )
}
