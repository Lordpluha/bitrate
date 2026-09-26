import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** List the caller's saved episodes, most recently saved first. */
export function GetSavedEpisodesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "List the caller's saved episodes" }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of saved episodes, each carrying a savedAt timestamp',
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid session' }),
  )
}
