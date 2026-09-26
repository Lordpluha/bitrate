import type { UserAuthRequest } from '@modules/users-auth/types'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Put,
  Query,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  GetPodcastByIdSwagger,
  GetPodcastsSwagger,
  GetSavedEpisodesSwagger,
  SaveEpisodeSwagger,
  UnsaveEpisodeSwagger,
} from './decorators'
import { PodcastsService } from './podcasts.service'

@ApiTags('Podcasts')
@Controller({ version: '1' })
export class PodcastsController {
  constructor(private readonly podcasts: PodcastsService) {}

  @GetPodcastsSwagger()
  @Get('podcasts')
  getAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('q') query?: string,
  ) {
    return this.podcasts.getAll(page, limit, query)
  }

  @GetPodcastByIdSwagger()
  @Get('podcasts/:id')
  getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.podcasts.getById(id, page, limit)
  }

  @GetSavedEpisodesSwagger()
  @UserAuth()
  @Get('me/episodes')
  saved(
    @Req() req: UserAuthRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.podcasts.getSavedEpisodes(req.user.id, page, limit)
  }

  @SaveEpisodeSwagger()
  @UserAuth()
  @HttpCode(204)
  @Put('me/episodes/:id')
  save(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.podcasts.saveEpisode(req.user.id, id)
  }

  @UnsaveEpisodeSwagger()
  @UserAuth()
  @HttpCode(204)
  @Delete('me/episodes/:id')
  unsave(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.podcasts.unsaveEpisode(req.user.id, id)
  }
}
