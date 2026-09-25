import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** Get the tracks chart, ranked by distinct listener-hours over a rolling window. */
export function GetChartsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get the tracks chart',
      description:
        '`global` and `country` cover the last 28 days; `viral` covers the last 7. `country` requires the `country` query param (ISO country name, case-insensitive).',
    }),
    ApiQuery({
      name: 'scope',
      required: false,
      enum: ['global', 'viral', 'country'],
      description: 'Chart scope (default global)',
    }),
    ApiQuery({
      name: 'country',
      required: false,
      type: String,
      description: 'Required when scope is country',
    }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({ status: HttpStatus.OK, description: 'A ranked page of tracks with play counts' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid scope, or country scope missing the country param',
    }),
  )
}
