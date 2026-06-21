import { BadRequestException, Controller, Get, ParseIntPipe, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SearchSwagger } from './decorators'
import { SearchService, type SearchType } from './search.service'

/** Represents the search controller. */
@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /** Runs the search operation. */
  @SearchSwagger()
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
