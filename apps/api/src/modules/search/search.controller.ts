import { BadRequestException, Controller, Get, ParseIntPipe, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { SearchService, type SearchType } from './search.service'

/** Represents the search controller. */
@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /** Runs the search operation. */
  @ApiOperation({ summary: 'Full-text search across tracks, artists, albums and playlists' })
  @ApiQuery({ name: 'q', type: String, description: 'Search query' })
  @ApiQuery({
    name: 'types',
    required: false,
    isArray: true,
    enum: ['tracks', 'artists', 'albums', 'playlists'],
    description: 'Entity types to search (defaults to all)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Max results per type',
  })
  @ApiResponse({ status: 200, description: 'Search results grouped by type' })
  @Get('')
  async search(
    @Query('q') query: string,
    @Query('types') types?: string | string[],
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    if (!query?.trim()) throw new BadRequestException('Search query is required')
    if (limit !== undefined && (limit < 1 || limit > 50)) {
      throw new BadRequestException('Search limit must be between 1 and 50')
    }

    const requestedTypes = types ? (Array.isArray(types) ? types : [types]) : undefined
    const allowedTypes: SearchType[] = ['tracks', 'artists', 'albums', 'playlists']
    if (requestedTypes?.some((type) => !allowedTypes.includes(type as SearchType))) {
      throw new BadRequestException('Invalid search type')
    }
    const parsedTypes = requestedTypes as SearchType[] | undefined

    return await this.searchService.search(query, parsedTypes, limit)
  }
}
