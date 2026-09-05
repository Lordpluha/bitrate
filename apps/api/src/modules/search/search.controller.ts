import { normalizePagination } from '@common/pagination'
import type { OptionalUserAuthRequest, UserAuthRequest } from '@modules/users-auth/types'
import { OptionalUserAuth, UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SearchSwagger } from './decorators'
import { SearchService } from './search.service'
import { ALL_SEARCH_TYPES, type SearchType } from './search.types'

@ApiTags('Search')
@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @SearchSwagger()
  @OptionalUserAuth()
  @Get()
  async search(
    @Req() req: OptionalUserAuthRequest,
    @Query('q') query: string,
    @Query('types') types?: string | string[],
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
    @Query('genre') genre?: string,
    @Query('artist') artist?: string,
  ) {
    if (!query?.trim()) throw new BadRequestException('Search query is required')
    const pagination = normalizePagination(page, limit ?? 10)
    const requestedTypes = types ? (Array.isArray(types) ? types : [types]) : ALL_SEARCH_TYPES
    if (requestedTypes.some((type) => !ALL_SEARCH_TYPES.includes(type as SearchType))) {
      throw new BadRequestException('Invalid search type')
    }

    return await this.searchService.search(query.trim(), {
      types: requestedTypes as SearchType[],
      page: pagination.page,
      limit: pagination.limit,
      year,
      genre,
      artist,
      userId: req.user?.id,
    })
  }

  @UserAuth()
  @Get('history')
  getHistory(
    @Req() req: UserAuthRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const pagination = normalizePagination(page, limit)
    return this.searchService.getHistory(req.user.id, pagination.page, pagination.limit)
  }

  @UserAuth()
  @Delete('history')
  clearHistory(@Req() req: UserAuthRequest) {
    return this.searchService.clearHistory(req.user.id)
  }
}
