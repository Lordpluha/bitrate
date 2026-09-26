import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** List podcasts, optionally filtered by a title search, most recently updated first. */
export function GetPodcastsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'List podcasts' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({
      name: 'q',
      required: false,
      type: String,
      description: 'Case-insensitive title search',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of podcasts with their episode count',
    }),
  )
}
