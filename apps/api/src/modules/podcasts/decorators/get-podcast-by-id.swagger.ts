import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { EPISODE_SEARCH_MAX_LENGTH } from '../dtos/episode-search.dto'

/** Get a podcast by id, with a page of its (optionally searched) episodes, newest release first. */
export function GetPodcastByIdSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a podcast by id, with its episodes' }),
    ApiParam({ name: 'id', type: 'string', format: 'uuid' }),
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Episodes page' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Episodes page size' }),
    ApiQuery({
      name: 'q',
      required: false,
      schema: { type: 'string', maxLength: EPISODE_SEARCH_MAX_LENGTH },
      description: 'Case-insensitive episode title or description search',
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'The podcast with a page of its episodes' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Podcast not found' }),
  )
}
