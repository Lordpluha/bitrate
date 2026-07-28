import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

export function SearchSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Full-text search across tracks, artists, albums and playlists' }),
    ApiQuery({ name: 'q', type: String, description: 'Search query' }),
    ApiQuery({
      name: 'types',
      required: false,
      isArray: true,
      enum: ['tracks', 'artists', 'albums', 'playlists'],
      description: 'Entity types to search (defaults to all)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10,
      description: 'Max results per type',
    }),
    ApiResponse({ status: 200, description: 'Search results grouped by type' }),
  )
}
