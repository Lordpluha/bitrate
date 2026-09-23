import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** Get the caller's own most-played tracks over a listening window. */
export function GetTopTracksSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Get the caller's top tracks",
      description:
        '`short` covers 28 days, `medium` covers 180 days, `long` covers roughly 10 years.',
    }),
    ApiQuery({
      name: 'range',
      required: false,
      enum: ['short', 'medium', 'long'],
      description: 'Listening window (default medium)',
    }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({ status: HttpStatus.OK, description: 'A ranked page of the caller’s top tracks' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid time range' }),
  )
}
