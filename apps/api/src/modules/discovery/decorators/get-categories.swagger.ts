import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** List browse categories (genres) with track/album/artist counts, cached. */
export function GetCategoriesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'List browse categories' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({ status: HttpStatus.OK, description: 'A page of genres, sorted alphabetically' }),
  )
}
