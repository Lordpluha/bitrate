import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { ArtistSearchEntity } from '../entities/artist-search.entity'

export function ArtistSearchSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: "Search the artist's releases, tracks and tasks by title",
      description: 'Case-insensitive; at most 5 results per group.',
    }),
    ApiQuery({ name: 'q', required: true, type: String }),
    ApiResponse({ status: HttpStatus.OK, type: ArtistSearchEntity }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Query shorter than 2 characters' }),
  )
}
