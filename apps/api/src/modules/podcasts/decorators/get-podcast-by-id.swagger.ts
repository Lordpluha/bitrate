import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** Get a podcast by id, with a paginated page of its episodes, newest release first. */
export function GetPodcastByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a podcast by id, with its episodes' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Episodes page' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Episodes page size' }),
    ApiResponse({ status: HttpStatus.OK, description: 'The podcast with a page of its episodes' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Podcast not found' }),
  )
}
