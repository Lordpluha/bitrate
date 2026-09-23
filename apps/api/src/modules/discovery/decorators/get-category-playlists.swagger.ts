import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** List public playlists belonging to a browse category, most-followed first. */
export function GetCategoryPlaylistsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'List playlists in a browse category' }),
    ApiParam({ name: 'slug', type: 'string', description: 'The category (genre) slug' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of public playlists, most-followed first',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' }),
  )
}
